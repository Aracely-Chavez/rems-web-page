// @ts-nocheck
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Image from "next/image";
import { InputLabeled } from "@/components/ui/InputLabeled";
import { LogicaPago } from "@/components/login/LogicaPago"
import { Navbar } from "@/components/ui/Navbar";
import { useSearchParams } from 'next/navigation'
interface ValoresState {
  [key: string]: string;
}

export default function ContratoEdit() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContratoEditContent />
        </Suspense>
    );
  }


function ContratoEditContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get('contrato');
    const [cantidadComponentes, setCantidadComponentes] = useState(1);
    const [indexes, setIndexes] = useState([]);
    const [valoresInputs, setValoresInputs] = useState<ValoresState>({});
    const [data, setData] = useState({fechas: [], pagos: []});
    const [isData, setIsData] = useState(false);
    const [lastEstType, setLastEstType] = useState(-1); //En desuso

  useEffect(() => {
    loadInitialData();
  },[])

  function loadInitialData(){
    const url = 'http://164.68.101.193:5000/contrato_por_id?id='+ search;
        //const url = 'http://127.0.0.1:5000/contratos_por_ids?ids=' + search;

        const fetchData = async () => {
          try {
            const requestOptions = {
              method: 'GET',
            };
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
              throw new Error('Error al obtener los datos');
            }
            const resp = await response.json();
            console.log(resp);
            setValoresInputs(resp.valores);
            //setData(resp.data);
            //setIsData(true);
            setCantidadComponentes(resp.cantidadComponentes);
            setIndexes(resp.indexes)
          } catch (error) {
            alert("Hubo un error al buscar el contrato")
          }
        };
    
        fetchData();
  }

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

  const ultimoTipoEstacionamiento = () => {
    var n = 0;
    var lastEst = -1;
    var logica;
    for (var i = 0; i < cantidadComponentes; i++) {
      if ("logica" + n in valoresInputs) {
          logica = valoresInputs["logica" + n];
          if(logica["tipoPago"]=="xEstacionamiento"){
            lastEst=n;
          }
      }
      n = n + 1;
    }
    console.log("ultimo Est: "+lastEst);
    setLastEstType(lastEst);
  };

  const agregarComponente = () => {
    setIndexes(
      [
        ...indexes,
        cantidadComponentes
      ]
    );
    setCantidadComponentes(cantidadComponentes + 1);
  };

  const quitarComponente = (index:number) => {
    const nuevoArray = indexes.filter(elemento => elemento !== index);
    const nuevoObjeto = { ...valoresInputs };
    setIndexes(nuevoArray);
    delete nuevoObjeto["logica" + index];
    setValoresInputs(nuevoObjeto);
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
                  n = n + 1;
                  continue;
              }
              mesesCorte.push(parseInt(logica['mes']))
              if (logica['tipoPago'] === 'fijo') {
                  pagosCorte.push(parseFloat(logica['valores'][0]));
              } else if (logica['tipoPago'] === 'tasa') {
                  pagosCorte.push("tasa "+logica['valores'][1] + " " + parseFloat(logica['valores'][0]) + ",99999");
              } else if (logica['tipoPago'] === 'xEstacionamiento') {
                  //pagosCorte.push(parseFloat(logica['valores'][0]) + "," + parseFloat(logica['valores'][2]) + " estacionamiento");
                  pagosCorte.push("0," + parseFloat(logica['valores'][0]) + " estacionamiento");
              } else if (logica['tipoPago'] === 'xDeposito') {
                pagosCorte.push(parseFloat(logica['valores'][0]) + " deposito");
              } else if (logica['tipoPago'] === 'xM2') {
                pagosCorte.push(parseFloat(logica['valores'][0])+" "+logica['valores'][1] + " m2");
              } else if (logica['tipoPago'] === 'tasaIPC') {
                pagosCorte.push("ipc o tasa "+logica['valores'][0]+",99999");
            }
          }

          const data = {
              razon_social: valoresInputs['Razón Social *'],
              plazo: parseInt(valoresInputs['Plazo (meses) *']),
              periodo_gracia: parseInt(valoresInputs['Periodo de gracia (días) *']),
              fecha_inicio: valoresInputs['Fecha de entrega *'],
              fecha_entrega: valoresInputs['Fecha de inicio *'],
              meses_corte: mesesCorte,
              monto_corte: pagosCorte,
              cant_estacionamientos: parseInt(valoresInputs['Cantidad de estacionamientos']),
              cant_depositos: parseInt(valoresInputs['Cantidad de depósitos']),
              m2_estacionamientos: parseFloat(valoresInputs['M2 total de estacionamientos']),
              m2_local: parseFloat(valoresInputs['M2 total de oficinas']),
              m2_depositos: parseFloat(valoresInputs['M2 total de depósitos']),
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
          //const url = 'http://127.0.0.1:5000/calcular_pagos';

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

  const savePago = () => {
    var nexIndex = 0;
    var n = 0;
    var logica = [];
    for (var i = 0; i < cantidadComponentes; i++) {
      if ("logica" + n in valoresInputs) {
          valoresInputs["logica" + n]['indice']=nexIndex;
          logica.push(valoresInputs["logica" + n]);
          nexIndex+=1;
      }
      n = n + 1;
    }
    const dataS = {
      razon_social: valoresInputs['Razón Social *'],
      plazo: parseInt(valoresInputs['Plazo (meses) *']),
      periodo_gracia: parseInt(valoresInputs['Periodo de gracia (días) *']),
      fecha_inicio: valoresInputs['Fecha de entrega *'],
      fecha_entrega: valoresInputs['Fecha de inicio *'],
      meses_corte: data.fechas,
      monto_corte: data.pagos,
      logica:logica,
      cant_estacionamientos: parseInt(valoresInputs['Cantidad de estacionamientos']),
      cant_depositos: parseInt(valoresInputs['Cantidad de depósitos']),
      m2_estacionamientos: parseFloat(valoresInputs['M2 total de estacionamientos']),
      m2_local: parseFloat(valoresInputs['M2 total de oficinas']),
      m2_depositos: parseFloat(valoresInputs['M2 total de depósitos']),
      moneda: valoresInputs['moneda'],
      ipc: {
          "2019": 1.90,
          "2020": 1.97,
          "2021": 6.43,
          "2022": 8.45,
          "2023": 3.23
      }

    };
    const url = 'http://164.68.101.193:5000/guardar_pagos';
    //const url = 'http://127.0.0.1:5000/guardar_pagos';
    const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataS)
    };

    fetch(url, requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la solicitud de guardado');
        }
        return response.json(); // o response.text() dependiendo de la respuesta esperada
    })
    .then(data => {
        alert('Registro correcto');
        // Puedes agregar aquí cualquier otra lógica que necesites realizar con los datos
    })
    .catch(error => {
        console.error('Error al realizar la solicitud de guardado:', error);
        alert('Hubo un error al realizar la solicitud de guardado');
    });
  };

  return (
    <main className="flex relative w-full justify-center font-montserrat mb-7">
      <img src="/HeaderBackground.svg" alt="bg" className="absolute w-[100%] xl:-top-24 min-h-[400px] -top-6 -z-10" />
      <div className="container px-8">
        <Navbar />
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
              <InputLabeled handleInputChange={handleInputChange} label="Razón Social *" value={valoresInputs['Razón Social *'] || ''}/>
            </div>
            <div className="col-span-6 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Fecha de entrega *" type="date" value={valoresInputs['Fecha de entrega *'] || ''}/>
            </div>
            <div className="col-span-6 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Fecha de inicio *" type="date" value={valoresInputs['Fecha de inicio *'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Plazo (meses) *" type="number" value={valoresInputs['Plazo (meses) *'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Periodo de gracia (días) *" type="number" value={valoresInputs['Periodo de gracia (días) *'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Cantidad de estacionamientos" type="number" value={valoresInputs['Cantidad de estacionamientos'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="M2 total de estacionamientos" value={valoresInputs['M2 total de estacionamientos'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="M2 total de oficinas" value={valoresInputs['M2 total de oficinas'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="Cantidad de depósitos" type="number" value={valoresInputs['Cantidad de depósitos'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <InputLabeled handleInputChange={handleInputChange} label="M2 total de depósitos" type="number" value={valoresInputs['M2 total de depósitos'] || ''}/>
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-3 xl:col-span-2">
              <div className='relative flex flex-col justify-between h-full'>
                <label htmlFor="Moneda" className='block my-2 lg:text-lg font-semibold'>Moneda</label>
                <select className="border-2 rounded-md border-black p-2 w-full" onChange={(event) => handleInputChange("moneda",event.target.value)}>
                    <option value="Dolares">Dólares</option>
                    <option value="Soles">Soles</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className='relative'>
          <button onClick={agregarComponente} type="button" className="absolute top-5 md:top-6 right-0 md:right-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Agregar Fila</button>
          <h2 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl py-6">Lógica de pagos</h2>
          <div className="flex flex-col divide-y-2">
            {indexes.map((index) => (
              <LogicaPago data={valoresInputs["logica" + index]} lastEstType={lastEstType} key={index} customKey={index} handleInputChangeP={handleInputChange} handleSubmit={handleSubmit} quitarComponente={quitarComponente}/> // Usa un key único para cada componente
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
              <table className="min-w-full text-left text-sm font-light text-surface dark:text-white">
                <thead className="border-b border-neutral-200 font-medium dark:border-white/10">
                  <tr>
                    <th scope="col" className="px-6 py-4">Fecha</th>
                    {data.fechas.map((fecha, index) => (
                      <th key={index} className="px-6 py-4 whitespace-nowrap">{fecha}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200 dark:border-white/10">
                    <td className="whitespace-nowrap px-6 py-4">Monto de Pago</td>
                    {data.pagos.map((pago, index) => {
                      if (pago === 'PG') {
                        return (
                          <td key={index} className="whitespace-nowrap px-6 py-4 bg-green-200">
                            {pago}
                          </td>
                        );
                      }

                      const montoRedondeado = Math.round((pago + Number.EPSILON) * 100) / 100;
                      // Si es el primer elemento, no hay monto anterior para comparar
                      if (index === 0) {
                        return (
                          <td key={index} className="whitespace-nowrap px-6 py-4">
                            {montoRedondeado}
                          </td>
                        );
                      }
                      if (index === data.pagos.length - 1) {
                        return (
                          <td key={index} className="whitespace-nowrap px-6 py-4 font-bold">
                            {montoRedondeado}
                          </td>
                        );
                      }

                      const montoAnterior = Math.round((data.pagos[index - 1] + Number.EPSILON) * 100) / 100;
                      const claseFondo = montoRedondeado !== montoAnterior ? 'bg-orange-200' : '';

                      return (
                        <td key={index} className={`whitespace-nowrap px-6 py-4 ${claseFondo}`}>
                          {montoRedondeado}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <button onClick={() => savePago()} type="button" className="w-36 mt-5 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Guardar</button>
      </div>}

        

      </div>

    </main>
  );
}
