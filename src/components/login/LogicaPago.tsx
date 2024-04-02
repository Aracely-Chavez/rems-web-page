// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { InputLabeledIn } from '../ui/InputLabeledIn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

interface LogicaPagoProps {
    handleInputChangeP: (index: string, value) => void;
    customKey: number;
    handleSubmit: (cantidadComponentes: number, render: boolean) => Promise<number>;
    lastEstType: number;
    quitarComponente: (index:number) => void;
  }

  interface ValoresState {
    [key: string]: string;
  }

export function LogicaPago({handleInputChangeP,customKey, handleSubmit, lastEstType, quitarComponente}: LogicaPagoProps) {
    const [tipoPago, setTipoPago] = useState<string>('fijo');
    const [valoresInputs, setValoresInputs] = useState<string[]>([]);
    const [valoresLogica, setValoresLogica] = useState<ValoresState>({});
    const [checked, setChecked] = useState(false);
    const [checkedEst, setCheckedEst] = useState(false);
    const [flagEst, setFlagEst] = useState(0);

    useEffect(() => {
        handleLogicaChange("tipoPago",'fijo');
    },[])

    const valores = {
        fijo: ['Monto'],
        tasa: ['Tasa'],
        xEstacionamiento: ['Monto base', 'switch', 'Costo x Est.'],
        xM2: ['Monto x M2','switchEst'],
        tasaIPC: ['Tasa']
      };

    const handleTipoPagoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTipoPago(event.target.value);
        const inputElement = document.querySelector('div[logica-key="'+customKey+'"] input[data-key="0"]');
        inputElement.disabled = false;
        setChecked(false);
        setCheckedEst(false);
        handleLogicaChange("tipoPago", event.target.value);
        setFlagEst(prevValue => prevValue + 1);
    };

    const handleLogicaChange = (index: string, value: any) => {
      setValoresLogica(prevState => {
          const result = {
              ...prevState,
              [index]: value
          };
          console.log(customKey);
          handleInputChangeP("logica" + customKey, result);
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

    const handleSwitchEstChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      setCheckedEst(event.target.checked);
      const cantValores = valores[tipoPago].filter(item => item !== 'switchEst').length;
      if(event.target.checked==false){
        setValoresInputs(prevState => {
            const newState = [...prevState].slice(0,cantValores);
            newState[parseInt(event.target.dataset.key!)] = event.target.value;
            handleLogicaChange("valores",newState);
            return newState;
        });
      }
      
    };
  
  return (
    <div className='flex flex-wrap gap-3 justify-between' logica-key={customKey}>
      <div className='flex flex-wrap gap-3 pt-4'>
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
          ) 
          : 
          valor === 'switchEst' && lastEstType!=-1 && customKey > lastEstType?
          (
              <div className='mt-3'>
                <FormControlLabel control={<Switch checked={checkedEst} onChange={handleSwitchEstChange}/>} label="Inc. por tasa para estacionamiento" />
                
              </div>
            
          ):
          valor != 'switchEst' &&
          (
            <div className='w-44 pb-4'>
                <InputLabeledIn onChange={handleInputChange} customKey={index} label={valor} />
              </div>
          )}
        </div>
      ))}
      {checkedEst && lastEstType!=-1 &&
        <div className='w-44 pb-4'>
          <InputLabeledIn onChange={handleInputChange} customKey={valores[tipoPago].length - 1} label={"Tasa x Est."} />
        </div>
      }
      </div>
      <div className='flex'>
        <div className='w-15 pb-4 pt-4 flex flex-col justify-center mr-5'>
          <Button variant="outlined" color='primary' startIcon={<FontAwesomeIcon icon={faEraser} />}>
            Limpiar
          </Button>
        </div>
        <div className='w-15 pb-4 pt-4 flex flex-col justify-center mr-5'>
          <Button onClick={event => quitarComponente(customKey)} variant="outlined" color='error' startIcon={<FontAwesomeIcon icon={faTrash} />}>
            Eliminar
          </Button>
        </div>
      </div>
      
    </div>
  )
}

export default LogicaPago