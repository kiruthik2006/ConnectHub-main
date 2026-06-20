

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from '@chakra-ui/react'
import { useRecoilState, useSetRecoilState,} from 'recoil'
import userAtom from '../atoms/userAtom'
import { useRef, useState } from 'react'
import usePrevImage from '../hooks/usePrevImage'
import toast from 'react-hot-toast'


export default function UpdateProfilePage() {
  const [updating,setUpdating]=useState(false)
    const [user] = useRecoilState(userAtom)
    const setUser = useSetRecoilState(userAtom)
    const fileRef = useRef(null)
    const [inputs,setInputs]=useState({name:user.name,username:user.username,email:user.email,bio:user.bio,password:""})


const {handleImageChange,imageUrl} = usePrevImage()

 const handleSubmit = async(e)=>{
  e.preventDefault()
  setUpdating(true)
  try {
  
    const res = await fetch(`/api/users/update/${user._id}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({...inputs,profilePic:imageUrl})

    })
    const data = await res.json()
    console.log("updateProfile:",data)
  
    if(data.error){
      throw new Error(data.error)
    }
    localStorage.setItem("user-threads",JSON.stringify(data))
    setUser(data)
    toast.success("profile updated")
  } catch (error) {
    console.log("error in update:",error.message)
    toast.error(error.message)
  }finally{
    setUpdating(false)
  }

 }
  return (
  
    <Flex
     my={"2"}
      align={'center'}
      justify={'center'}
     >
      <Stack
        spacing={4}
        w={'full'}
        maxW={'md'}
        bg={useColorModeValue('white', 'gray.dark')}
        rounded={'xl'}
        boxShadow={'lg'}
        p={6}
       >
        <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
          User Profile Edit
        </Heading>
        <FormControl>
          <FormLabel>User Icon</FormLabel>
          <Stack direction={['column', 'row']} spacing={6}>
            <Center>
              <Avatar size="xl" boxShadow={"md"} src={imageUrl || user.profilePic} ref={fileRef} />
                
              
            </Center>
            <Center w="full">
              <Button w="full"  onClick={()=>fileRef.current.click()} >Change Avatar</Button>
              <Input type="file" onChange={handleImageChange} hidden ref={fileRef} />
            </Center>
          </Stack>
        </FormControl>
        <FormControl  isRequired>
          <FormLabel>Full name</FormLabel>
          <Input value={inputs.name} onChange={(e)=>setInputs({...inputs,name:e.target.value})}
            placeholder="Arunpravin"
            _placeholder={{ color: 'gray.500' }}
            type="text"
          />
        </FormControl>
        <FormControl  isRequired>
          <FormLabel>User name</FormLabel>
          <Input value={inputs.username} onChange={(e)=>setInputs({...inputs,username:e.target.value})}
            placeholder="Arun"
            _placeholder={{ color: 'gray.500' }}
            type="text"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email address</FormLabel>
          <Input value={inputs.email} onChange={(e)=>setInputs({...inputs,email:e.target.value})}
            placeholder="your-email@example.com"
            _placeholder={{ color: 'gray.500' }}
            type="email"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Bio</FormLabel>
          <Input value={inputs.bio} onChange={(e)=>setInputs({...inputs,bio:e.target.value})}
            placeholder="Your bio"
            _placeholder={{ color: 'gray.500' }}
            type="text"
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input value={inputs.password} onChange={(e)=>setInputs({...inputs,password:e.target.value})}
            placeholder="password"
            _placeholder={{ color: 'gray.500' }}
            type="password"
          />
        </FormControl>
        <Stack spacing={6} direction={['column', 'row']}>
          <Button
            bg={'red.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'red.500',
            }}>
            Cancel
          </Button>
          <Button isLoading={updating} onClick={handleSubmit}
            bg={'green.400'}
            color={'white'}
            w="full"
            _hover={{
              bg: 'green.500',
            }}>
            Submit
          </Button>
        </Stack>
      </Stack>
    </Flex>
    
  )
}