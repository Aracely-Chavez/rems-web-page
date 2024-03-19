// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { InputLabeledIn } from '../ui/InputLabeledIn'
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface LogicaPagoProps {
    handleInputChangeP: (index: string, value) => void;
    customKey: number;
    handleSubmit: (cantidadComponentes: number, render: boolean) => Promise<number>;
  }

  interface ValoresState {
    [key: string]: string;
  }

export function LogicaPago({handleInputChangeP,customKey, handleSubmit}: LogicaPagoProps) {
    const [tipoPago, setTipoPago] = useState<string>('fijo');
    const [valoresInputs, setValoresInputs] = useState<string[]>([]);
    const [valoresLogica, setValoresLogica] = useState<ValoresState>({});
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        handleLogicaChange("tipoPago",'fijo');
    },[])

    const valores = {
        fijo: ['Monto'],
        tasa: ['Tasa'],
        xEstacionamiento: ['Monto base', 'switch', 'Costo x Est.'],
        xM2: ['Mts. Cruadrados'],
        tasaIPC: ['Tasa']
      };

    const handleTipoPagoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTipoPago(event.target.value);
        handleLogicaChange("tipoPago",event.target.value);
        const inputElement = document.querySelector('div[logica-key="'+customKey+'"] input[data-key="0"]');
        inputElement.disabled = false;
        setChecked(false);
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

    const handleSwitchChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      const inputElement = document.querySelector('div[logica-key="'+customKey+'"] input[data-key="0"]');
      setChecked(event.target.checked);
      if(event.target.checked){
        handleSubmit(customKey,false) // Ejemplo de llamada a la función con un valor de cantidadComponentes
        .then((respuesta) => {
          console.log("Respuesta recibida:", respuesta);
          inputElement.value = respuesta;
          setValoresInputs(prevState => {
              const newState = [...prevState];
              newState[0] = respuesta;
              handleLogicaChange("valores",newState);
              return newState;
          });
        })
        .catch((error: any) => {
          console.error("Error al llamar a handleSubmit:", error);
        });
      };
      inputElement.disabled = event.target.checked;
    };
  
  return (
    <div className='flex flex-wrap gap-3  pt-4' logica-key={customKey}>
        <div className='w-36'>
            <InputLabeledIn onChange={handleMesCorteChange} label='Mes de corte' type='number'/>
        </div>
        <div className='grow max-w-80'>
            <InputLabeledIn isSelect handleSelectTipoPago={handleTipoPagoChange} label='Tipo de pago'/>
        </div>
        {tipoPago && valores[tipoPago].map((valor, index) => (
        <div key={index}>
          {valor === 'switch' ? (
            <div className='mt-3'>
              <FormControlLabel control={<Switch checked={checked} onChange={handleSwitchChange}/>} label="Usar último monto" />
            </div>
          ) : (
              <div className='w-44 pb-4'>
                <InputLabeledIn onChange={handleInputChange} customKey={index} label={valor} />
              </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default LogicaPago