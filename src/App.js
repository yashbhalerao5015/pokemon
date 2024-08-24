import { useEffect, useState } from "react";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function PokeData() {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch("https://pokeapi.co/api/v2/pokemon");
      if (!res.ok) {
        throw new Error("Error fetching data");
      }
      const data = await res.json();
      if (data.Response === "False") {
        throw new Error("Pokemon Not Found");
      }
      const pokemonDetails = [];

      for (const pokemon of data.results) {
        const detailedRes = await fetch(pokemon.url);
        const detailedData = await detailedRes.json();
        pokemonDetails.push(detailedData);
      }
      setPokemons(pokemonDetails);
      setError("");
    } catch (error) {
      console.log(error);
      if (error.name !== "AbortError") {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    PokeData();
  }, []);

  return (
    <div className="App">
      <PokemonHeading />
      <SearchBar
        setPokemons={setPokemons}
        setIsLoading={setIsLoading}
        PokeData={PokeData}
        setError={setError}
      />
      <div className="Container">
        {isLoading && <Loader />}
        {error && !isLoading && <Error message={error} />}
        {!isLoading &&
          !error &&
          pokemons.map((pokemon) => <PokemonDetails pokemon={pokemon} />)}
      </div>
    </div>
  );
}
function PokemonHeading() {
  return (
    <h1 className="heading-center">
      Pokemon Data <span>🦁</span>
    </h1>
  );
}

function SearchBar({ setPokemons, setIsLoading, PokeData, setError }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length > 2) {
        setDebouncedQuery(query);
      }
    }, 1000);
    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!debouncedQuery) {
        PokeData();

        return;
      }
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${debouncedQuery.toLowerCase()}`
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error("Error fetching data");
        }

        if (data) {
          setPokemons([data]);
        }
      } catch (error) {
        console.log(error);
        setError("Pokemon Not Found");
        setPokemons([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPokemon();
  }, [debouncedQuery, setPokemons, setIsLoading, setError]);

  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search Pokemons.."
        size="30"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === "") {
            setDebouncedQuery("");
          }
        }}
      />
    </div>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}
function PokemonDetails({ pokemon }) {
  return (
    <div className="PokemonDetails">
      <ul>
        <img src={pokemon.sprites.front_default} alt={`${pokemon.name} img`} />
        <li className="uppercase-bold">{pokemon.name}</li>
      </ul>
    </div>
  );
}

export default App;
