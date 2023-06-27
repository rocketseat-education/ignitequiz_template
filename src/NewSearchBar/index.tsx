import {useState, useEffect} from 'react'
import {animes} from './apiAnimes'

interface Repo {
    name: string;
    episodes: number;
}

export function NewSearchBar(){
    
    const [repos, setRepos] = useState<Repo[]>([])
    const [search, setSearch] = useState('')
    
    // const filteredRepos = search.length > 0 ? repos.filter(repo => repo.name.includes(search)) : [];
    const filteredRepos = search.length > 0 ? repos.filter(repo => 
        repo.name.toLowerCase().includes(search.toLowerCase())) : [];
        // console.log('Resultado aqui as 11:59 =>', filteredRepos)
        
        useEffect(() => {
            setRepos(animes);
        
    }, [])

    return(
        <div>
            <input 
                type="text" 
                name='search'
                width="100%"
                placeholder='buscar...'
                onChange={event => setSearch(event.target.value)}
                value={search}
            />

            {search.length > 0 ? (
                filteredRepos.length > 0 ? (
                    <ul>
                        {filteredRepos.map(repo => {
                            return(
                                <li key={repo.name}>
                                    {repo.name}
                                </li>
                            )}
                        )}
                    </ul>
                ) : (
                    <p>Nenhum resultado encontrado</p>
                )
                ) : (
                    <ul>
                        {repos.map(repo => {
                            return(
                                <li key={repo.name}>
                                    {repo.name}
                                </li>
                            )}
                        )}
                    </ul>
                )
            }
        </div>
    )
}