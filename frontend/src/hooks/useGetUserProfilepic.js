import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

const useGetUserProfilepic = () => {
    const [user,setUser]=useState(null)
const [loading,setLoading]=useState(true)
const {username}=useParams()

useEffect(()=>{
    const getUser = async()=>{
        try {
          const res = await fetch(`/api/users/profile/${username}`)
          const data = await res.json()
          console.log("userPages user:",data)
          if(data.error){
            throw new Error(data.error)
          }
          if(data.isFrozen){
            setUser(null)
            return;
          }
          setUser(data)
        } catch (error) {
          console.log("error in Userpages",error)
          toast.error(error.message)
        }finally{
          setLoading(false)
        }
     }
     getUser()
  
    
},[username])

return{loading,user}

}

export default useGetUserProfilepic
