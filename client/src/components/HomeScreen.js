import React, { useEffect, useReducer, useState } from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import axios from 'axios';
import Product from '../components/Product';
const reducer=(state,action)=>{
    switch(action.type)
    {
        case 'FETCH_REQUEST': return {...state,loading:true};
        case 'FETCH_SUCCESS':return {...state,pizzas:action.payload,loading:false};
        case 'FETCH_FAIL':return {...state,loading:false,error:action.payload};
        default: return state;
    }
}
function Home() {
  const [{loading,error,pizzas,},dispatch]=useReducer(reducer,{
    pizzas:[],
    loading:true,
    error:[],

  })

    useEffect(() => {
        const fetchData=async()=>{
            dispatch({type:'FETCH_REQUEST'});
            try {
                 const result=await axios.get('/api/products');
                 dispatch({type:'FETCH_SUCCESS',payload:result.data})
            } catch (error) {
                dispatch({type:'FETCH_FAIL',payload:error.message})
            }
           
           
        };
        fetchData();
    }, [])
   
    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>PIZZA MENU</h1>
            <div className="products">
                
                {
                 loading ? (<div>Loading ...</div>):(
                   <Row>
                { pizzas.map((Pizza) => {
                    return (
                        <Col  key={Pizza.id}sm={6} md={4} lg={3} className="mb-3">
                       <Product Pizza={Pizza}></Product>
                    </Col>
                    )

                })
            }
            </Row>
                
                )}
               
                
            </div>
            
        </div>
    )
}

export default Home;