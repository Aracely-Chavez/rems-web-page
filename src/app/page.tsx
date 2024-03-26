// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { InputLabeled } from "@/components/ui/InputLabeled";
import { LogicaPago } from "@/components/login/LogicaPago"
interface ValoresState {
  [key: string]: string;
}

export default function Home() {
  const [cantidadComponentes, setCantidadComponentes] = useState(1);
  const [valoresInputs, setValoresInputs] = useState<ValoresState>({});
  const [data, setData] = useState({fechas: [], pagos: []});
  const [isData, setIsData] = useState(false);

  function convertirFecha(fechaEnMMDDAAAA) {
    // Dividir la fecha en sus componentes (mes, día y año)
    var partes = fechaEnMMDDAAAA.split('-');
    
    // Crear un nuevo objeto Date con los componentes en el formato "mm-dd-aaaa"
    var fecha = new Date(partes[0], partes[1] - 1, partes[2]); // El mes debe ser ajustado restando 1 ya que en JavaScript los meses van de 0 a 11
    
    // Obtener los componentes de la fecha en formato "dd-mm-aaaa"
    var dia = fecha.getDate();
    var mes = fecha.getMonth() + 1; // Se suma 1 ya que getMonth devuelve los meses de 0 a 11
    var anio = fecha.getFullYear();
    
    // Formatear la fecha en el formato deseado "dd-mm-aaaa"
    var fechaEnDDMMAAAA = (dia < 10 ? '0' : '') + dia + '-' + (mes < 10 ? '0' : '') + mes + '-' + anio;
    
    return fechaEnDDMMAAAA;
}

  const agregarComponente = () => {
    setCantidadComponentes(cantidadComponentes + 1);
  };

  const quitarComponente = () => {
    if (cantidadComponentes > 0) {
      setCantidadComponentes(cantidadComponentes - 1);
    }
  };

  const handleInputChange = (index: string, value) => {
    setValoresInputs(prevState => {
        const result = {
          ...prevState,
          [index]: value
        }
        console.log(result);
        return result;
      });
  };

  const handleSubmit = (cantidadComponentes: number, render: boolean): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
          var n = 0;
          const mesesCorte = [];
          const pagosCorte = [];
          var logica;
          for (var i = 0; i < cantidadComponentes; i++) {
              if ("logica" + n in valoresInputs) {
                  logica = valoresInputs["logica" + n];
                  n = n + 1;
              } else {
                  continue;
              }
              mesesCorte.push(parseInt(logica['mes']))
              if (logica['tipoPago'] === 'fijo') {
                  pagosCorte.push(parseFloat(logica['valores'][0]));
              } else if (logica['tipoPago'] === 'tasa') {
                  pagosCorte.push("tasa " + parseFloat(logica['valores'][0]) + ",99999");
              } else if (logica['tipoPago'] === 'xEstacionamiento') {
                  pagosCorte.push(parseFloat(logica['valores'][0]) + "," + parseFloat(logica['valores'][2]) + " estacionamiento");
              } else if (logica['tipoPago'] === 'xM2') {
                  pagosCorte.push(parseFloat(logica['valores'][0]) + " m2");
              } else if (logica['tipoPago'] === 'tasaIPC') {
                pagosCorte.push("ipc o tasa "+logica['valores'][0]+",99999");
            }
          }

          const data = {
              razon_social: valoresInputs['Razón Social *'],
              plazo: parseInt(valoresInputs['Plazo (meses) *']),
              periodo_gracia: parseInt(valoresInputs['Periodo de gracia (días) *']),
              fecha_inicio: valoresInputs['Fecha de inicio *'],
              fecha_entrega: valoresInputs['Fecha de entrega *'],
              meses_corte: mesesCorte,
              monto_corte: pagosCorte,
              cant_estacionamientos: parseInt(valoresInputs['Cantidad de estacionamientos']),
              m2_local: valoresInputs['M2 total de oficinas'],
              ipc: {
                  "2019": 1.90,
                  "2020": 1.97,
                  "2021": 6.43,
                  "2022": 8.45,
                  "2023": 3.23
              }
          };

          console.log(data);

          const url = 'http://164.68.101.193:5000/calcular_pagos';

          const requestOptions = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          };

          fetch(url, requestOptions)
              .then(response => response.json())
              .then(data => {
                  if(render){
                    setData(data);
                    setIsData(true);
                  }
                  const ultimoPago = data["pagos"][data["pagos"].length - 2];
                  resolve(ultimoPago);
              })
              .catch(error => {
                  console.error('Error al realizar la solicitud:', error);
                  reject(error);
              });
      });
  };

  const handleCopy = () => {
    const textFechas = ['Razón Social','Fecha de inicio','Fecha de entrega','Plazo (meses)','Periodo de gracia (días)',...data.fechas].join('\t');
    const textPagos = [valoresInputs['Razón Social *'],convertirFecha(valoresInputs['Fecha de inicio *']),convertirFecha(valoresInputs['Fecha de entrega *']),valoresInputs['Plazo (meses) *'],valoresInputs['Periodo de gracia (días) *'],...data.pagos].join('\t');
    const textToCopy = textFechas + '\n' + textPagos;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
  };

  return (
    <main className="flex relative w-full justify-center font-montserrat mb-7">
      <img src="/HeaderBackground.svg" alt="bg" className="absolute w-[100%] xl:-top-24 min-h-[400px] -top-6 -z-10" />
      <div className="container px-8">
        <div className="flex h-[280px] sm:h-[330px] md:h-[360px] lg:h-[410px] 2xl:h-[520px]  justify-center items-center">
          <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Asset Management</h1>
        </div>
        <div>
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl py-6">Datos del edificio</h2>
          <div className="grid grid-flow-row grid-cols-12 w-full gap-x-3 sm:gap-x-4">
            <div className="col-span-12 sm:col-span-9">
              <InputLabeled handleInputChange={handleInputChange} label="Nombre del propietario *"/>
            </div>
            <div className="col-span-12 sm:col-span-3">
              <InputLabeled handleInputChange={handleInputChange} label="RUC *"/>
            </div>
            <div className="col-span-12">
              <InputLabeled handleInputChange={handleInputChange} label="Dirección *"/>
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl py-6">Datos Generales</h2>
          <div className="grid grid-flow-row grid-cols-12 w-full gap-x-3 sm:gap-x-4 items-stretch">
            <div className="col-span-12 xl:col-span-8">
              <InputLabeled handleInputChange={handleInputChange} label="Razón Social *"/>
            </div>
            <div className="col-span-6 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Fecha de inicio *" type="date"/>
            </div>
            <div className="col-span-6 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Fecha de entrega *" type="date"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Plazo (meses) *" type="number"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Periodo de gracia (días) *" type="number"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Cantidad de estacionamientos" type="number" />
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="M2 total de estacionamientos"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="M2 total de oficinas"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Cantidad de depósitos" type="number"/>
            </div>
          </div>
        </div>
        <div className='relative'>
          <button onClick={agregarComponente} type="button" className="absolute top-5 md:top-6 right-0 md:right-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Agregar Fila</button>
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl py-6">Lógica de pagos</h2>
          <div className="flex flex-col divide-y-2">
            {Array.from({ length: cantidadComponentes }).map((_, index) => (
              <LogicaPago key={index} customKey={index} handleInputChangeP={handleInputChange} handleSubmit={handleSubmit}/> // Usa un key único para cada componente
            ))}
          </div>
          <button onClick={() => handleSubmit(cantidadComponentes,true)} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Generar Pagos</button>
        </div>
        

        {isData&&
        <div className ="flex flex-col">
        <button onClick={() => handleCopy()} type="button" className="w-36 text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Copiar</button>
        <div className ="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className ="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className ="overflow-hidden">
              <table
                className ="min-w-full text-left text-sm font-light text-surface dark:text-white">
                <thead
                  className ="border-b border-neutral-200 font-medium dark:border-white/10">
                  <tr>
                    <th scope="col" className ="px-6 py-4">Fecha</th>
                    <th scope="col" className ="px-6 py-4">Monto de Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fechas.map((fecha, index) => (
                    <tr className ="border-b border-neutral-200 dark:border-white/10" key={index}>
                      <td className ="whitespace-nowrap px-6 py-4">{fecha}</td>
                      <td className ="whitespace-nowrap px-6 py-4">{data.pagos[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>}

        

      </div>

    </main>
  );
}
