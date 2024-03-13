import React, { useEffect, useState } from 'react'
import { InputLabeledIn } from '../ui/InputLabeledIn'

interface LogicaPagoProps {
    handleInputChangeP: (index: string, value) => void;
    customKey: number
  }

  interface ValoresState {
    [key: string]: string;
  }

export function LogicaPago({handleInputChangeP,customKey}: LogicaPagoProps) {
    const [tipoPago, setTipoPago] = useState<string>('fijo');
    const [valoresInputs, setValoresInputs] = useState<string[]>([]);
    const [valoresLogica, setValoresLogica] = useState<ValoresState>({});

    useEffect(() => {
        handleLogicaChange("tipoPago",'fijo');
    },[])

    const valores = {
        fijo: ['Monto'],
        tasa: ['Tasa'],
        xEstacionamiento: ['Monto base', 'Costo x Est.'],
        xM2: ['Mts. Cruadrados'],
        tasaIPC: ['Tasa']
      };

    const handleTipoPagoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTipoPago(event.target.value);
        handleLogicaChange("tipoPago",event.target.value);
    };

    const handleLogicaChange = (index: string, value) => {
        setValoresLogica(prevState => {
            const result = {
              ...prevState,
              [index]: value
            }
            console.log(customKey);
            handleInputChangeP("logica"+customKey,result);
            return result;
        });
    };

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setValoresInputs(prevState => {
            const newState = [...prevState];
            newState[parseInt(event.target.dataset.key!)] = event.target.value;
            handleLogicaChange("valores",newState);
            return newState;
        });
    };

    const handleMesCorteChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        handleLogicaChange("mes",event.target.value);
    };
  
  return (
    <div className='flex flex-wrap gap-3  pt-4'>
        <div className='w-36'>
            <InputLabeledIn onChange={handleMesCorteChange} label='Mes de corte' type='number'/>
        </div>
        <div className='grow max-w-80'>
            <InputLabeledIn isSelect handleSelectTipoPago={handleTipoPagoChange} label='Tipo de pago'/>
        </div>
        {tipoPago && valores[tipoPago].map((valor, index) => (
        <div key={index} className='w-44 pb-4'>
          <InputLabeledIn onChange={handleInputChange} customKey ={index} label={valor}/>
        </div>
      ))}
    </div>
  )
}

export default LogicaPago