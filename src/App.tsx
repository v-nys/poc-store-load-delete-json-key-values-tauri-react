import { Fragment, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {

    const [collections, setCollections] = useState(new Map());
    const [paths, setPaths] = useState("");

    useEffect(() => {
        invoke("read", {})
            .then((collections) => {
                console.debug(collections);
                setCollections(new Map(Object.entries(collections as object)));
            })
            .catch((e) => {
                alert(`Failed to set initial list of collections: ${e}`);
            });
    }, []);

    async function store() {
        const collection = prompt("How will you refer to this collection of paths?");
        try {
            const collections = await invoke("store", { collection, paths });
            setCollections(new Map(Object.entries(collections as object)));
        } catch (e) {
            alert(e as string);
        }
    }

    return (
        <div className="container">
            <h1>Welcome to Tauri!</h1>

            <div className="row">
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo vite" alt="Vite logo" />
                </a>
                <a href="https://tauri.app" target="_blank">
                    <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <textarea
                id="collection-input"
                onChange={(e) => setPaths(e.currentTarget.value)}
                value={paths}
                placeholder="Enter ';'-separated paths"
            />
            <button onClick={(e) => {
                e.preventDefault();
                store();
            }}>Store cluster collection</button>
            {
                collections.keys() ?
                    Array.from(collections).map(([collectionName, collectionText]) => {
                        return (<div className="collection-controls" key={collectionName} >
                            <button
                                onClick={() => { setPaths(collectionText); }}>
                                load collection: {collectionName}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        // copy shenanigans to force React to update
                                        const newCollections = new Map(collections);
                                        newCollections.delete(collectionName);
                                        await invoke("remove", { name: collectionName });
                                        setCollections(newCollections);
                                    }
                                    catch (e) {
                                        alert(e as string);
                                    }
                                }}>
                                delete collection: {collectionName}
                            </button>
                        </div>)
                    })
                    : <Fragment />
            }
        </div>
    );
}

export default App;
