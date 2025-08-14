/*import { useState, useEffect } from "react" //useState is a hook 'use' is keyword for hooks

const CardComponent = ({title}) => { //Component names start with capital letter
  const [hasLiked,setHasLiked] = useState(false); //[variable_name,setVariable_name]

  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(`${title} movie has been liked: ${hasLiked}` )
  },[hasLiked]); //dependency array or deps check if that variable change to fir e the useEffect
  return( 
    <div className="card" onClick={() => 
      setCount((prevState) => prevState + 1)
    }>
      <h2>{title}-{count}</h2>
      <button onClick={() => setHasLiked(!hasLiked)}>{ hasLiked ? '♥️' : '🤍'}</button>
    </div>
  )
}

const App = () => {
  

  return(
    <div className="card-container">
      <h2>Functional Arrow Component</h2>
      <CardComponent title="Star Warz" rating={5} isCool={true} />
      <CardComponent title="Avatar"/>
      <CardComponent title="Pirates Of Carribeans"/>
    </div>
  )
}

export default App*/


//Imports
import React from 'react'
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import Search from './components/search';
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard';

//TMDB API SETTINGS

const API_BASE_URL = 'https://api.themoviedb.org/3'; //base url
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; //impoet api key from .env
const API_OPTIONS = { //provide context for our api
  method:'GET',
  headers: {
    accept:'application/json',
    Authorization:`Bearer ${API_KEY}`,
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState(''); //search bar state
  const [errorMessage, setErrorMessage] = useState(''); //to dispaly error
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsloading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  useDebounce(() => setDebouncedSearchTerm(searchTerm),500,[searchTerm])

  const fetchMovies = async (query = '') => {
    setIsloading(true); 
    setErrorMessage('');
    try {
      const endpoint = query ? 
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint,API_OPTIONS)
      if (!response.ok){
        throw new Error('Failed to Fetch Movies');
      }
      const data = await response.json();
      if (data.Respomse === 'False'){
        setErrorMessage(data.Error || 'Failed to Fetch Movies')
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
    } catch (error) {
      console.log(`Error fetch movies: ${error}`);
      setErrorMessage('Error fetching movies.Please try again later.')
    }finally{
      setIsloading(false);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm])


  return (
    <main>
      <div className='pattern'/>
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
          <h2 className='mt-[40px]'>All Movies</h2>
          {isloading ? (
             <Spinner/>
          ):errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ):(
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
