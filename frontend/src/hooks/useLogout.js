import { useSetRecoilState } from "recoil"
import userAtom from "../atoms/userAtom"
import toast from "react-hot-toast"
import { useState } from "react"


const useLogout = () => {
    const setUser =   useSetRecoilState(userAtom)
//  const navigate =useNavigate()
 const [loading,setLoading]=useState(false)
    const Logout = async()=>{
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

    return {loading,Logout}
 
}

export default useLogout
