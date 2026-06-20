import {
  Avatar,
  Box,
  Flex,
  Image,
  Skeleton,
  Text,
  Link,
  Icon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { selectedConversationAtom } from "../atoms/conversationAtom";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import {
  BsFileEarmarkPdf,
  BsFileEarmarkWord,
  BsFileEarmark,
} from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import { FaMicrophone } from "react-icons/fa";
import { CgMoreVertical } from "react-icons/cg";
import toast from "react-hot-toast";
import LinkPreview from "./LinkPreview";

const Message = ({ ownMessage, message, onDelete }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const currentUser = useRecoilValue(userAtom);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Extract URLs from message text
  const extractUrls = (text) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const urls = text.match(urlRegex) || [];
    return urls.filter((url) => {
      try {
        const urlObj = new URL(url);
        // Only show previews for post and story URLs
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        return (
          (pathParts.length >= 3 && pathParts[1] === "post") ||
          (pathParts.length >= 2 && pathParts[1] === "story")
        );
      } catch {
        return false;
      }
    });
  };

  const urlsInMessage = useMemo(() => {
    return message.text ? extractUrls(message.text) : [];
  }, [message.text]);

  const renderMessageText = (text, textColor) => {
    if (!text) return null;

    // Regex to match markdown links: [Link Text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add text before the link
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const linkText = match[1];
      const linkUrl = match[2];

      let isInternal = false;
      let path = "";
      try {
        const urlObj = new URL(linkUrl);
        // Check if the host matches our current host or is localhost/render
        if (
          urlObj.hostname === window.location.hostname ||
          urlObj.hostname === "localhost" ||
          urlObj.hostname === "127.0.0.1" ||
          urlObj.hostname.endsWith(".onrender.com")
        ) {
          isInternal = true;
          path = urlObj.pathname + urlObj.search + urlObj.hash;
        }
      } catch {
        // Fallback for relative paths if any
        if (linkUrl.startsWith("/")) {
          isInternal = true;
          path = linkUrl;
        }
      }

      parts.push(
        <Link
          key={matchIndex}
          href={linkUrl}
          isExternal={!isInternal}
          color={textColor === "white" ? "cyan.200" : "blue.500"}
          textDecoration="underline"
          fontWeight="semibold"
          _hover={{ color: textColor === "white" ? "cyan.100" : "blue.600" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isInternal) {
              navigate(path);
            } else {
              window.open(linkUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          {linkText}
        </Link>
      );

      lastIndex = markdownLinkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Check if message is deleted for everyone (tombstone)
  const isTombstone = message.deletedForAll || message.type === "tombstone";

  // Check if user can delete for everyone (sender only, within 48 hours)
  const canDeleteForEveryone = ownMessage && !isTombstone;
  const messageAge = message.createdAt
    ? Date.now() - new Date(message.createdAt).getTime()
    : Infinity;
  const within48Hours = messageAge <= 48 * 60 * 60 * 1000;
  const showDeleteForEveryone = canDeleteForEveryone && within48Hours;

  const handleDeleteForMe = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/messages/${message._id}/delete-for-me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (onDelete) onDelete(message._id, "me");
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/messages/${message._id}/delete-for-everyone`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (onDelete) onDelete(message._id, "everyone");
      toast.success("Message deleted for everyone");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  // Render tombstone for deleted messages
  if (isTombstone) {
    return (
      <Flex gap={2} alignSelf={ownMessage ? "flex-end" : "flex-start"}>
        {!ownMessage && (
          <Avatar src={selectedConversation.userProfilePic} w="7" h={7} />
        )}
        <Flex
          bg={useColorModeValue("gray.100", "gray.700")}
          maxW={"350px"}
          p={2}
          borderRadius={"xl"}
          alignItems="center"
          gap={2}
          opacity={0.6}
        >
          <Text
            color={useColorModeValue("gray.500", "gray.400")}
            fontStyle="italic"
            fontSize="sm"
          >
            {message.tombstoneText || "This message was deleted"}
          </Text>
        </Flex>
        {ownMessage && <Avatar src={currentUser.profilePic} w="7" h={7} />}
      </Flex>
    );
  }

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"} position="relative" group>
          {message.text && (
            <Flex
              flexDirection="column"
              maxW={"350px"}
              alignItems="flex-end"
              gap={2}
            >
              <Flex
                bg={useColorModeValue("brand.500", "brand.400")}
                p={2}
                borderRadius={"xl"}
                alignItems="flex-end"
                gap={2}
              >
                <Text
                  color={"white"}
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {renderMessageText(message.text, "white")}
                </Text>
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "whiteAlpha.900" : "whiteAlpha.700"}
                  fontWeight={"bold"}
                  flexShrink={0}
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
              {/* Link Previews */}
              {urlsInMessage.length > 0 && (
                <Flex flexDirection="column" gap={2} w="full">
                  {urlsInMessage.map((url, index) => (
                    <LinkPreview key={index} url={url} />
                  ))}
                </Flex>
              )}
            </Flex>
          )}
          {message.img && !isImgLoading && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setIsImgLoading(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}
          {message.img && isImgLoading && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.500" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.video &&
            typeof message.video === "string" &&
            message.video.includes("res.cloudinary.com") &&
            message.video.includes("/video/upload/") && (
              <Flex mt={5} w={"300px"} flexDirection="column">
                <Box
                  as="video"
                  src={message.video}
                  controls
                  w={"300px"}
                  maxH="300px"
                  borderRadius={4}
                />
                <Box
                  alignSelf={"flex-end"}
                  ml={1}
                  color={message.seen ? "blue.500" : ""}
                  fontWeight={"bold"}
                  mt={1}
                >
                  <BsCheck2All size={16} />
                </Box>
              </Flex>
            )}
          {message.audio && message.audio.trim() !== "" && (
            <Flex mt={5} w={"300px"} flexDirection="column" gap={2}>
              <Box
                p={3}
                border="1px solid"
                borderColor={useColorModeValue("sand.200", "ink.700")}
                borderRadius="lg"
                bg={useColorModeValue("sand.50", "ink.800")}
              >
                <Flex alignItems="center" gap={3} mb={2}>
                  <Icon as={FaMicrophone} w={6} h={6} color="red.500" />
                  <Text fontWeight="semibold" fontSize="sm">
                    Voice Message
                  </Text>
                </Flex>
                <Box as="audio" src={message.audio} controls w="full" />
              </Box>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.500" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.fileUrl && (
            <Flex mt={5} w={"300px"} flexDirection="column" gap={2}>
              <Box
                p={3}
                border="1px solid"
                borderColor={useColorModeValue("sand.200", "ink.700")}
                borderRadius="lg"
                bg={useColorModeValue("sand.50", "ink.800")}
              >
                <Flex alignItems="center" gap={3}>
                  {message.fileType === "application/pdf" ? (
                    <Icon as={BsFileEarmarkPdf} w={8} h={8} color="red.500" />
                  ) : message.fileType.includes("word") ||
                    message.fileType.includes("document") ? (
                    <Icon as={BsFileEarmarkWord} w={8} h={8} color="blue.500" />
                  ) : (
                    <Icon as={BsFileEarmark} w={8} h={8} color="gray.500" />
                  )}
                  <Box flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {message.fileName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {message.fileType.split("/")[1]?.toUpperCase() || "File"}
                    </Text>
                  </Box>
                  <Link
                    href={message.fileUrl}
                    download={message.fileName}
                    isExternal
                  >
                    <Icon as={FiDownload} w={5} h={5} color="blue.500" />
                  </Link>
                </Flex>
              </Box>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.500" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          <Avatar src={currentUser.profilePic} w="7" h={7} />
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<CgMoreVertical />}
              variant="ghost"
              size="xs"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
            />
            <MenuList>
              <MenuItem onClick={handleDeleteForMe} isDisabled={isDeleting}>
                Delete for me
              </MenuItem>
              {showDeleteForEveryone && (
                <MenuItem
                  onClick={handleDeleteForEveryone}
                  isDisabled={isDeleting}
                >
                  Delete for everyone
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
      ) : (
        <Flex gap={2} alignSelf={"flex-start"} position="relative" group>
          <Avatar src={selectedConversation.userProfilePic} w="7" h={7} />
          {message.text && (
            <Flex flexDirection="column" maxW={"350px"} gap={2}>
              <Text
                color={useColorModeValue("ink.900", "whiteAlpha.900")}
                bg={useColorModeValue("sand.200", "ink.700")}
                p={2}
                borderRadius={"xl"}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {renderMessageText(message.text, "dark")}
              </Text>
              {/* Link Previews */}
              {urlsInMessage.length > 0 && (
                <Flex flexDirection="column" gap={2}>
                  {urlsInMessage.map((url, index) => (
                    <LinkPreview key={index} url={url} />
                  ))}
                </Flex>
              )}
            </Flex>
          )}

          {message.img && !isImgLoading && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setIsImgLoading(true)}
                alt="Message image"
                borderRadius={4}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}
          {message.img && isImgLoading && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
            </Flex>
          )}
          {message.video &&
            typeof message.video === "string" &&
            message.video.includes("res.cloudinary.com") &&
            message.video.includes("/video/upload/") && (
              <Flex mt={5} w={"300px"}>
                <Box
                  as="video"
                  src={message.video}
                  controls
                  w={"300px"}
                  maxH="300px"
                  borderRadius={4}
                />
              </Flex>
            )}
          {message.audio && message.audio.trim() !== "" && (
            <Flex mt={5} w={"300px"} flexDirection="column" gap={2}>
              <Box
                p={3}
                border="1px solid"
                borderColor={useColorModeValue("sand.200", "ink.700")}
                borderRadius="lg"
                bg={useColorModeValue("sand.50", "ink.800")}
              >
                <Flex alignItems="center" gap={3} mb={2}>
                  <Icon as={FaMicrophone} w={6} h={6} color="red.500" />
                  <Text fontWeight="semibold" fontSize="sm">
                    Voice Message
                  </Text>
                </Flex>
                <Box as="audio" src={message.audio} controls w="full" />
              </Box>
            </Flex>
          )}
          {message.fileUrl && (
            <Flex mt={5} w={"300px"} flexDirection="column" gap={2}>
              <Box
                p={3}
                border="1px solid"
                borderColor={useColorModeValue("sand.200", "ink.700")}
                borderRadius="lg"
                bg={useColorModeValue("sand.50", "ink.800")}
              >
                <Flex alignItems="center" gap={3}>
                  {message.fileType === "application/pdf" ? (
                    <Icon as={BsFileEarmarkPdf} w={8} h={8} color="red.500" />
                  ) : message.fileType.includes("word") ||
                    message.fileType.includes("document") ? (
                    <Icon as={BsFileEarmarkWord} w={8} h={8} color="blue.500" />
                  ) : (
                    <Icon as={BsFileEarmark} w={8} h={8} color="gray.500" />
                  )}
                  <Box flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {message.fileName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {message.fileType.split("/")[1]?.toUpperCase() || "File"}
                    </Text>
                  </Box>
                  <Link
                    href={message.fileUrl}
                    download={message.fileName}
                    isExternal
                  >
                    <Icon as={FiDownload} w={5} h={5} color="blue.500" />
                  </Link>
                </Flex>
              </Box>
            </Flex>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<CgMoreVertical />}
              variant="ghost"
              size="xs"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
            />
            <MenuList>
              <MenuItem onClick={handleDeleteForMe} isDisabled={isDeleting}>
                Delete for me
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      )}
    </>
  );
};

export default Message;
