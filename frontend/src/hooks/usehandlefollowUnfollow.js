import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'

const usehandlefollowUnfollow = (user) => {
   
    const [updating,setUpdating]=useState(false)
    const currentUser = useRecoilValue(userAtom)
    const [following,setFollowing]=useState(user.followers.includes(currentUser?._id))
    const handleFollowAndUnfollow = async()=>{
        if(!currentUser){
          toast.error("Please login to follow")
          return;
        }
        if(updating) return;
        setUpdating(true)
        try {
          const res = await fetch(`/api/users/follow/${user._id}`,{
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
          })
          const data = await res.json()
  
          console.log(data)
          if(data.error){
            throw new Erro(data.error)
          }
          if(following){
            toast.success(`Unfollowed ${user.name} successfully`)
            user.followers.pop() // only update in client side
          }else{
            toast.success(`followed ${user.name} successfully`)
            user.followers.push(currentUser?._id) // only update in client side
          }
          setFollowing(!following)
        } catch (error) {
          console.log("error in followUnFollow",error.message)
          toast.error(error.message)
        } finally{
          setUpdating(false)
        }
      }
 return {handleFollowAndUnfollow,updating,following}
}

export default usehandlefollowUnfollow
