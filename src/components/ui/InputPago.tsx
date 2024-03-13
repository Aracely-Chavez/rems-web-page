import React from 'react'
interface Props extends React.InputHTMLAttributes<HTMLInputElement>{
    customKey?:number
}

export function InputPago({customKey , ...props}: Props) {
  return (
    <input 
        className='border-2 rounded-md border-black p-2 w-full'
        {...props}
        data-key={customKey}
    />
  )
}

export default InputPago


