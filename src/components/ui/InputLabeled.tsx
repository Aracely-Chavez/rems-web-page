import React from 'react'
import { Input } from './Input'
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    isSelect?: boolean;
    handleInputChange: (index: string, value) => void;
  }
export function InputLabeled({label,isSelect,handleInputChange, ...props}:Props) {

  const handleInternalInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(label,event.target.value);
  }

  return (
    <div className='relative flex flex-col justify-between h-full'>
        <label htmlFor={label} className='block my-2 lg:text-lg font-semibold'>{label}</label>
        {isSelect ? (
            <select className="border-2 rounded-md border-black p-2 w-full">
                <option value="enero">Enero</option>
                <option value="febrero">Febrero</option>
            </select>
        ): (
        <Input
            {...props}
            onChange={handleInternalInputChange}
        />
        )}
        
    </div>
  )
}

export default InputLabeled