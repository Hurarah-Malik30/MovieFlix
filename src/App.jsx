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
import { getTrendingMovies, updateSearchCount } from './appwrite';

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('') //debouncing search to stop unnecessary searches
  const [searchTerm, setSearchTerm] = useState(''); //search bar state

  const [movieList, setMovieList] = useState([]); //all movies list
  const [errorMessage, setErrorMessage] = useState(''); //to dispaly error
  const [isloading, setIsloading] = useState(false) //loader


  const [trendingMovies, setTrendingMovies] = useState([]);//trending movies 

  useDebounce(() => setDebouncedSearchTerm(searchTerm),500,[searchTerm]) //debounce hook

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

      if(query && data.results.length > 0){
        await updateSearchCount(query,data.results[0]);
      }
    } catch (error) {
      console.log(`Error fetch movies: ${error}`);
      setErrorMessage('Error fetching movies.Please try again later.')
    }finally{
      setIsloading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies.Please try again`)
      
    }
  }


  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  },[])


  return (
    <main>
      <div className='pattern'/>
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie,index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title}/>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className=''>Popular</h2>
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
