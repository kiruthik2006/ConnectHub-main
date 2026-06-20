import  { useState } from 'react'
import toast from 'react-hot-toast'

const usePrevImage = () => {
    const [imageUrl,setImageUrl]=useState(null)

    const handleImageChange = (e)=>{
        const file = e.target.files[0]
        console.log(file)
        if(file && file.type.startsWith("image/")){
            const reader = new FileReader()

            reader.onload = ()=>{
                setImageUrl(reader.result)
            }
            reader.readAsDataURL(file)
        }else{
            toast.error("Ivalid file type","Please select a Image file")
            setImageUrl(null)
        }

       

    }
   
  return {handleImageChange,imageUrl,setImageUrl}
   
}

export default usePrevImage
