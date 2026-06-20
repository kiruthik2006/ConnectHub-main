import { Button, Text } from '@chakra-ui/react'
import React from 'react'
import toast from 'react-hot-toast';
import useLogout from '../hooks/useLogout';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const SettingsPage = () => {
     
    const currentUser = useRecoilValue(userAtom)
    const {Logout,loading}=useLogout()

    const freezeAccount = async()=>{
        if(!window.confirm("Are you sure you want to freeze your account"))return;

       try {
         const res= await fetch('/api/users/freeze',{
            method:"PUT",
            headers:{"Content-Type":"application/json"}
         })
         const data = await res.json()
         if(data.error){
            throw new Errro(data.erorr)
         }
         console.log(data)
         if(data.success){
           await Logout()
            toast.success(`you account ${currentUser.username} has been frozen`)
         }
         
       } catch (error) {
        toast.error(error.message)
        
       }
    }
  return (
    <>
     <Text my={1} fontWeight={"bold"} >Freeze Your Account</Text>
     <Text  my={1} >You can unFreeze Your Account any time by loging.</Text>
     <Button isLoading={loading} onClick={freezeAccount} size={"sm"} colorScheme='red'>Freeze</Button>
    </>
  )
}

export default SettingsPage
