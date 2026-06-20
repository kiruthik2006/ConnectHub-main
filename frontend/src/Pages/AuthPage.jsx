import React from 'react'
import LoginCard from '../components/LoginCard'
import { useRecoilValue,  } from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import SignupCard from '../components/SignupCard'

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom)
  
    console.log('auth:',authScreenState)
  return (
    <div>
    
      {authScreenState == "login"? <LoginCard/> :  <SignupCard/>}
    </div>
  )
}

export default AuthPage
