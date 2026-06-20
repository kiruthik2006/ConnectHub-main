import { Button} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useSetRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import toast from 'react-hot-toast'
import { RiLogoutBoxRLine } from "react-icons/ri";
// import { useNavigate } from 'react-router-dom'
const LogoutButton = () => {
 const setUser =   useSetRecoilState(userAtom)
//  const navigate =useNavigate()
 const [loading,setLoading]=useState(false)
    const handleLogout = async()=>{
       try {
        setLoading(true)
        const res = await fetch("/api/users/logout",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            }
        })

        const data = await res.json()
        console.log(data)
        if(data.error){
          throw new Error(data.error)
       
        }

        localStorage.removeItem("user-threads")
        setUser(null)
        
        toast.success('Logout Successfully')
        // navigate("/auth")
       } catch (error) {
        console.log("error in logout",error)
        toast.error(error.data)
       }finally{
        setLoading(false)
       }
    }
  return (
    <Button isLoading={loading}  disabled={loading} onClick={handleLogout}
    postion={"fixed"}
    top={"10px"}
    marginLeft={"90%"}
    size={"sm"}>
     <RiLogoutBoxRLine size={"20"}/>
    </Button>
  )
}

export default LogoutButton
