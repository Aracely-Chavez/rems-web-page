// @ts-nocheck
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from "@/components/ui/Navbar";
import { format, parse, parseISO } from 'date-fns';


const ContratoCard = ({ contrato, isChecked, onToggle }) => {
  const { id, razon_social, fecha_inicio, fecha_creacion } = contrato;

  const handleToggle = () => {
    onToggle(id);
  };

  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white flex justify-between items-center">
      <div>
          <h3 className="text-xl font-semibold mb-2">{razon_social}</h3>
          <p className="text-gray-600">Fecha de inicio: {format(parseISO(fecha_inicio), 'dd/MM/yyyy')}</p>
          <p className="text-gray-600">Fecha de creación: {format(new Date(fecha_creacion), 'dd/MM/yyyy HH:mm:ss a')}</p>
          {/* Otros datos del contrato */}
          {/* ... */}
      </div>
      <div className="ml-4">
          <Link href={{ pathname: '/contratoEdit', query: { contrato: id } }}
              className=" bg-blue-500 hover:bg-blue-700 h-6 text-white font-bold py-2 px-4 mx-6 rounded">
              Editar
          </Link>
          <label className="inline-flex items-center">
          <input
              type="checkbox"
              className="form-checkbox h-6 w-6 text-indigo-600"
              checked={isChecked}
              onChange={handleToggle}
          />
          <span className="ml-2 text-gray-700">Seleccionar</span>
          </label>
      </div>
    </div>
  );
};

const ContratosScreen = ( ) => {
  const [contratos, setContratos] = useState<[]>([]);
  const [selectedContratos, setSelectedContratos] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sortOption, setSortOption] = useState('razon_social');
  const [isAscending, setIsAscending] = useState(true);

  const handleSortOptionChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSortOrderChange = () => {
    setIsAscending(!isAscending);
  };

  const handleSelectAll = () => {
    if (contratos.length !== selectedContratos.length){
      const newSelectedContratos = [];
      contratos.forEach(contrato => {
        newSelectedContratos.push(contrato.id);
      });
      setSelectedContratos(newSelectedContratos);
    }
    else{
      setSelectedContratos([]);
    }
  }


  useEffect(() => {
    const url = 'http://164.68.101.193:5000/contratos';
    //const url = 'http://127.0.0.1:5000/contratos';

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
        console.log(data)
        setContratos(data);
        setCargando(false);
      } catch (error) {
        setError(error.message);
        setCargando(false);
      }
    };

    fetchData();

  }, []);

  const handleToggleContrato = (id) => {
    setSelectedContratos((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((selectedId) => selectedId !== id) : [...prevSelected, id]
    );
  };

  const sortedList = [...contratos].sort((a, b) => {
    let aValue, bValue;

    if (sortOption === 'fecha_creacion') {
      aValue = new Date(a[sortOption]);
      bValue = new Date(b[sortOption]);
    } else {
      aValue = a[sortOption];
      bValue = b[sortOption];
    }

    if (aValue < bValue) return isAscending ? -1 : 1;
    if (aValue > bValue) return isAscending ? 1 : -1;
    return 0;
  });

  const handleDeleteClick = () => {
    setShowPopup(true);
  };

  const handleConfirmDelete = () => {
    deletePagos();
    setShowPopup(false);
  };

  const handleCancelDelete = () => {
    setShowPopup(false);
  };

  const deletePagos = () => {
    const url = 'http://164.68.101.193:5000/eliminar_contratos';
    //const url = 'http://127.0.0.1:5000/guardar_pagos';
    const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedContratos)
    };

    fetch(url, requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la solicitud de guardado');
        }
        return response.json(); // o response.text() dependiendo de la respuesta esperada
    })
    .then(data => {
        alert('Eliminación correcta');
        window.location.reload();
        // Puedes agregar aquí cualquier otra lógica que necesites realizar con los datos
    })
    .catch(error => {
        console.error('Error al realizar la solicitud de guardado:', error);
        alert('Hubo un error al realizar la solicitud de eliminación');
    });
  };

  return (
    <main className="flex relative w-full justify-center font-montserrat mb-7">
      <img src="/HeaderBackground.svg" alt="bg" className="absolute w-[100%] xl:-top-24 min-h-[400px] -top-6 -z-10" />
      <div className="container px-8">
        <Navbar />
        <div className="flex h-[280px] sm:h-[330px] md:h-[360px] lg:h-[410px] 2xl:h-[520px]  justify-center items-center">
          <h1 className="font-bold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Fechas de pago</h1>
        </div>
            <div>
            <h1>Contratos</h1>
            <div>
              <label>Ordenar por:</label>
              <select value={sortOption} onChange={handleSortOptionChange}>
                <option value="razon_social">Razón Social</option>
                <option value="fecha_creacion">Fecha de Creación</option>
                {/* Agrega más opciones según sea necesario */}
              </select>
              <button onClick={handleSortOrderChange}
              className=" bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded">
                {isAscending ? 'Ascendente' : 'Descendente'}
              </button>
              <div className="flex flex-row-reverse">
                <label className="inline-flex items-center">
                <input
                    type="checkbox"
                    className="form-checkbox h-6 w-6 text-indigo-600"
                    checked={contratos.length === selectedContratos.length}
                    onChange={handleSelectAll}
                />
                <span className="ml-2 text-gray-700">Seleccionar Todos</span>
                </label>
              </div>
            </div>
            <div className="contrato-container my-8">
                {sortedList.map((contrato) => (
                <ContratoCard
                    key={contrato.id}
                    contrato={contrato}
                    isChecked={selectedContratos.includes(contrato.id)}
                    onToggle={handleToggleContrato}
                />
                ))}
            </div>
              <div className='flex justify-between'>
                <Link href={{ pathname: '/fechasPago', query: { contratos: selectedContratos.join(',') } }}
                    className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Ir a Fechas de Pago
                </Link>
                <button onClick={handleDeleteClick} type="button" className="w-36 text-white bg-red-700 py-2 px-4 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Eliminar</button>
              </div>
            </div>
        </div>
        {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">¿Realmente quiere eliminar?</h2>
            <div className="flex justify-end">
              <button 
                onClick={handleCancelDelete} 
                className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg focus:outline-none">
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 rounded-lg focus:outline-none">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ContratosScreen;
