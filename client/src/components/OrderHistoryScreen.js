import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import Button from 'react-bootstrap/esm/Button';
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from './LoadingBox'
import MessageBox from './MessageBox'
const reducer=(state,action)=>{
    switch(action.type){
        case 'FETCH_REQUEST': return { ...state, loading: true};
        case 'FETCH_SUCCESS': return {...state,orders:action.payload,loading:false};
        case 'CREATE_FAIL': return { ...state,loading:false,error:action.payload};
        default : return state;
    }
}

export default function OrderHistoryScreen() {
    const {state}=useContext(Store);
   const {userInfo}= state;
   const navigate=useNavigate();
   const [{loading,error,orders},dispatch]=useReducer(reducer,{
    loading:true,
    error:'',
   
   })
   useEffect(() => {
    const fetchData=async()=>{
      dispatch({type:'FETCH_REQUEST'});
      try {
        const {data}= await axios.get('/api/orders/mine'
        ,{headers:{authorization:`Bearer${userInfo.token}`}}
        );
        console.log(data);
        dispatch({type:'FETCH_SUCCESS',payload:data})
      } catch (error) {
        dispatch({type:'FETCH_FAIL',payload:error})
      } 
    }
    fetchData();
      
   },[userInfo])
    return (
        <div>
            <Helmet>
                <title>Order History</title>
            </Helmet>
            <h3 style={{ textAlign: 'center' }}className="mb-3">Order History</h3>
            {loading?(<LoadingBox/>)
            :error?
            (<MessageBox variant="danger">{error}</MessageBox>):(
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>DATE</th>
                            <th>TOTAL</th>
                            <th>PAID</th>
                            <th>DELIVERED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                    {orders.map((order)=>{
                        return <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.createdAt.substring(0,10)}</td>
                             <td>{order.totalPrice.toFixed(2)}</td>
                              <td>{order.isPaid?order.paidAt.substring(0,10):'No'}</td>
                               <td>
                                {order.isDelivered ?order.deliveredAt.substring(0,10):'No'}
                               </td>
                               <td>
                                <Button type="button" variant="light" onChange={()=>{
                                    navigate(`/order/${order._id}`)
                                }}>
                                 Detalis
                                </Button>
                               </td>
                        </tr>
                    })}
                    </tbody>
                </table>
            )
        }
        </div>
    )
}
