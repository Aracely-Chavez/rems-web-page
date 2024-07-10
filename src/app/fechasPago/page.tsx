// @ts-nocheck
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { Navbar } from "@/components/ui/Navbar";
import { useSearchParams } from 'next/navigation'


export default function FechasPago() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
          <FechasPagoContent />
      </Suspense>
  );
}


function FechasPagoContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('contratos');

    const [contratos, setContratos] = useState<[]>([]);
    const [fechas, setFechas] = useState<string[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const url = 'http://164.68.101.193:5000/contratos_por_ids?ids='+ search;
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
            const data = await response.json();
            setContratos(data);
            setCargando(false);
          } catch (error) {
            setError(error.message);
            setCargando(false);
          }
        };
    
        fetchData();
    
      }, []);


      function startOfMonth(date)
        {
            // Create a new Date object representing the start of the month by using the year and month of the input date and setting the day to 1
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }

      useEffect(() => {
        
        let fechasSet: Set<string> = new Set();
        contratos.forEach(contrato => {
        contrato.pagos.forEach(pago => {
            fechasSet.add(pago.fecha);
        });
        });

        // Convertir Set a Array y ordenar las fechas
        const fechasOrdenadas = Array.from(fechasSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // Generar todas las fechas entre la más antigua y la más reciente, solo el primer día de cada mes
        const fechaInicio = new Date(fechasOrdenadas[0]);
        const fechaFin = new Date(fechasOrdenadas[fechasOrdenadas.length - 1]);
        fechaFin.setDate(fechaFin.getDate() + 2);
        const fechasIntermedias: string[] = [];
        let fecha = new Date(fechaInicio);
        while (fecha <= fechaFin) {
            fechasIntermedias.push(new Date(fecha).toISOString().split('T')[0]);
            fecha.setDate(fecha.getDate() + 32); // Aseguramos que siempre sea el primer día del mes
            fecha=startOfMonth(fecha);
        }

        // Establecer todas las fechas en el estado
        setFechas(fechasIntermedias);
      }, [contratos]);
  
    if (cargando) {
    return <div>Cargando...</div>;
    }
  
  let valorAnterior = null;

  return (
    <main className="flex relative w-full justify-center font-montserrat mb-7">
      <img src="/HeaderBackground.svg" alt="bg" className="absolute w-[100%] xl:-top-24 min-h-[400px] -top-6 -z-10" />
      <div className="container px-8">
        <Navbar />
        <div className="flex h-[280px] sm:h-[330px] md:h-[360px] lg:h-[410px] 2xl:h-[520px]  justify-center items-center">
          <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Fechas de pago</h1>
        </div>
        <div className ="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className ="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className ="overflow-hidden">
                <table className='min-w-full text-left text-sm font-light text-surface dark:text-white'>
                    <thead className="border-b border-neutral-200 font-medium dark:border-white/10">
                        <tr>
                          <th className="px-6 py-4">Razón Social</th>
                          <th className="px-6 py-4">Moneda</th>
                          <th className="px-6 py-4">Plazo</th>
                          {fechas.map(fecha => (
                              <th key={fecha} className="px-6 py-4 whitespace-nowrap">{fecha}</th>
                          ))}
                          <th className="px-6 py-4 font-bold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                    {contratos.map(contrato => {
                      let valorAnterior = '-'; // Inicializa valorAnterior para cada contrato
                      const totalMonto = contrato.pagos.reduce((suma, pago) => suma + pago.monto, 0);
                      return (
                        <tr key={contrato.id} className="border-b border-neutral-200 dark:border-white/10">
                          <td className="whitespace-nowrap px-6 py-4">{contrato.razon_social}</td>
                          <td className="whitespace-nowrap px-6 py-4">{contrato.moneda}</td>
                          <td className="whitespace-nowrap px-6 py-4">{contrato.plazo}</td>
                          {fechas.map(fecha => {
                            const pago = contrato.pagos.find(p => p.fecha === fecha);
                            const esPG = pago ? pago.monto == 0 : false;
                            const monto = pago ? (esPG ? 'PG' : pago.monto) : '-';

                            // Comprueba si el valor actual es diferente al valor anterior
                            const claseFondo = monto !== valorAnterior ? 'bg-orange-200' : '';

                            // Actualiza el valor anterior para la próxima iteración
                            valorAnterior = monto;

                            return (
                              <td key={fecha} className={`whitespace-nowrap px-6 py-4 ${esPG ? 'bg-green-200' : claseFondo}`}>
                                {monto}
                              </td>
                            );
                          })}
                          <td className="whitespace-nowrap px-6 py-4 font-bold">{Math.round((totalMonto + Number.EPSILON) * 100) / 100}</td>
                        </tr>
                      );
                    })}
                    </tbody>
                    </table>
                </div>
            </div>
            </div>
      </div>

    </main>
  );
}
