import { useState, useEffect } from "react";

// 'http://localhost:4000/blogs'
const useFetch = (url) => {
  const [data, setData ] = useState( null );
  const [isPending, setIsPending] = useState( true);
  const [error,setError] = useState( null );

  useEffect(() => {
    setTimeout(() => {
      fetch( url )
        .then( res => {
          if ( !res.ok ) throw Error( 'could not fetch resource' ); // <-- Other Errors..
          return res.json();
        }).then ( data => {
          setData( data);
          setIsPending(false);
          setError(null);
        }).catch( err => {
          setIsPending( false);
          setError( err.message );
        });

    }, 500);
  }, []);

  return { data, isPending, error };
}

export default useFetch;