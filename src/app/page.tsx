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


  const agregarComponente = () => {
    setCantidadComponentes(cantidadComponentes + 1);
  };

  const quitarComponente = () => {
    if (cantidadComponentes > 0) {
      setCantidadComponentes(cantidadComponentes - 1);
    }
  };

  const handleInputChange = (index: string, value: any) => {
    setValoresInputs(prevState => {
        const result = {
          ...prevState,
          [index]: value
        }
        console.log(result);
        return result;
      });
  };

  const handleSubmit = () => {
    var n = 0;
    var x = 0;
    const mesesCorte = [];
    const pagosCorte = [];
    var logica;
    while (true) {  
      if ("logica" + n in valoresInputs) {
          logica = valoresInputs["logica" + n];
          n = n + 1;
      } else {
        break;
      }  
      mesesCorte.push(parseInt(logica['mes']))
      if (logica['tipoPago'] === 'fijo'){
        pagosCorte.push(parseFloat(logica['valores'][0]));
      }
      else if(logica['tipoPago'] === 'tasa'){
        pagosCorte.push("tasa "+parseFloat(logica['valores'][0])+",99999");
      }
      else if(logica['tipoPago'] === 'xEstacionamiento'){
        pagosCorte.push(parseFloat(logica['valores'][0])+","+parseFloat(logica['valores'][1])+" estacionamiento");
      }

    }
    const data = {
      razon_social: valoresInputs['Razón Social *'],
      plazo: parseInt(valoresInputs['Plazo (meses) *']) ,
      periodo_gracia: parseInt(valoresInputs['Periodo de gracia *']),
      fecha_inicio: valoresInputs['Fecha de inicio *'],
      fecha_entrega: valoresInputs['Fecha de entrega *'],
      meses_corte: mesesCorte,
      monto_corte: pagosCorte,
      cant_estacionamientos: parseInt(valoresInputs['Cantidad de estacionamientos']),
      m2_local: valoresInputs['Área cuadrada de oficinas'],
      ipc: {
          "2019": 1.9,
          "2020": 1.97,
          "2021": 6.43,
          "2022": 8.4,
          "2023": 3.2
      }
  };
    console.log(data);
    const url = 'http://3.133.138.75:5000/calcular_pagos'; // URL de la API
    
    // Configuración de la solicitud
    const requestOptions = {
      method: 'POST', // Método de la solicitud
      headers: {
        'Content-Type': 'application/json' // Tipo de contenido que estás enviando
      },
      body: JSON.stringify(data) // Convertimos el objeto JavaScript a una cadena JSON
    };

    fetch(url, requestOptions)
    .then(response => response.json()) // Convertimos la respuesta a JSON
    .then(data => {
      setData(data);
      setIsData(true);
    })
    .catch(error => {
      console.error('Error al realizar la solicitud:', error); // Manejamos cualquier error
    });
  }

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
              <InputLabeled handleInputChange={handleInputChange} label="Periodo de gracia *" type="number"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Cantidad de estacionamientos" type="number" />
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Área cuadrada de estacionamientos"/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Área cuadrada de oficinas"/>
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
              <LogicaPago key={index} customKey={index} handleInputChangeP={handleInputChange}/> // Usa un key único para cada componente
            ))}
          </div>
          <button onClick={handleSubmit} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Generar Pagos</button>
        </div>
        

        {isData&&
        <div className ="flex flex-col">
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
