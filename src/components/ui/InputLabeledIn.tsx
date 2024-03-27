import React from 'react'
import { InputPago } from './InputPago'
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    isSelect?: boolean;
    handleSelectTipoPago?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    customKey ?: number;
  }

export function InputLabeledIn({label,isSelect,handleSelectTipoPago,customKey, ...props}:Props) {
  
    return (
    <div className='py-3 border-gray-300 relative'>
        <label htmlFor={label} className='absolute block text-sm bg-white lg:text-base font-semibold top-0 left-3 px-2'>{label}</label>
        <div>
            {isSelect ? (
                <select className="border-2 rounded-md border-black p-2 w-full" onChange={handleSelectTipoPago}>
                    <option value="fijo">Monto fijo</option>
                    <option value="tasa">Tasa o IPC (Máximo)</option>
                    <option value="xEstacionamiento">Por estacionamiento</option>
                    <option value="xM2">Por metro cuadrado</option>
                    {//<option value="tasaIPC">Tasa o IPC (Máximo)</option>
                    }
                </select>
            ): (
            <InputPago
                {...props}
                customKey ={customKey}
            />
            )}
        </div>
        
    </div>
  )
}

export default InputLabeledIn