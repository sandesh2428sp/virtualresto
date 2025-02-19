import React, { useContext, useEffect, useReducer } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { Helmet } from 'react-helmet-async';
import Checkoutsteps from './Checkoutsteps';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import Button from 'react-bootstrap/esm/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import LoadingBox from './LoadingBox';
const reducer=(state,action)=>{
    switch(action.type){
        case 'CREATE_REQUEST':return {...state,loading:true};
        case 'CREATE_SUCCESS':return{...state,loading:false};
        case 'CREATE_FAIL':return {...state,loading:false};
        default :return state;  
    }
}
export default function PlaceOrderScreen() {
    const navigate = useNavigate();
    const [{loading},dispatch]=useReducer(reducer,{
        loading:false,
     
    })
    const {state,dispatch:ctxDispatch}=useContext(Store);
    const {cart,userInfo}=state;
    useEffect(() => {
        if(!cart.paymentMethod)
        {
            navigate('/payment')
        }
    },[cart,navigate])
    const round2=(num)=>Math.round(num*100+Number.EPSILON)/100;
    cart.itemsPrice=round2(cart.cartItems.reduce((a,c)=>a+c.quantity*c.prices,0));
    cart.shippingPrice=cart.itemsPrice>100?round2(2):round2(10);
    cart.taxPrice=round2(0.05*cart.itemsPrice);
    cart.totalPrice=cart.itemsPrice+cart.shippingPrice+cart.taxPrice;
    const placeOrderHandler=async()=>{
      try {
         dispatch({type:'CREATE_REQUEST'});
         const {data}=await axios.post('/api/orders',{
            orderItems:cart.cartItems,
        shippingAddress:cart.shippingAddress,
      paymentMethod:cart.paymentMethod,
    itemsPrice:cart.itemsPrice,
   shippingPrice:cart.shippingPrice,
      taxPrice:cart.taxPrice,
    totalPrice:cart.totalPrice},
    {
        headers:{authorization:`Bearer${userInfo.token}`,
    }
    });
    ctxDispatch({ type: 'CART_CLEAR'});
    dispatch({type:'CREATE_SUCCESS'});
    localStorage.removeItem('cartItems');
    navigate(`/order/${data.order._id}`);
      } catch (error) {
         dispatch({type:'CREATE_FAIL'});
         toast.error(error);
      }
    }
    return (
        <div>
            <Checkoutsteps step1 step2 step3 step4></Checkoutsteps>
            <Helmet>
                <title>PlaceOrder</title>
            </Helmet>
            <h1 className="my-3 " style={{ textAlign: 'center' }}>Preview Order</h1>
            <Row>
                <Col md={8}>
                    <Card className="sigin-card">
                 <Card.Body>
                    <Card.Title>Shipping</Card.Title>
                    <Card.Text>
                        <strong>Name:</strong>{cart.shippingAddress.fullName}<br/>
                        <strong>Address:</strong>{cart.shippingAddress.address},{cart.shippingAddress.city}
                        ,{cart.shippingAddress.postalCode},{cart.shippingAddress.country}
                    </Card.Text>
                    <Link to="/shipping">Edit</Link>
                 </Card.Body>
                 </Card>
                 <Card className="mb-3 sigin-card mt-3" >
                    <Card.Title>Payment</Card.Title>
                    <Card.Text><strong>Method:</strong>{cart.paymentMethod}</Card.Text>
                    <Link to="/payment">Edit</Link>
                 </Card>
                 <Card className="mb-3 sigin-card" >
                     <Card.Body>
                        <Card.Title>Items</Card.Title>
                        <ListGroup variant="flush">
                            {cart.cartItems.map((item)=>{
                            return    <ListGroup.Item key={item._id}>
                                 <Row className="align-items-center">
                                <Col md={6}>
                                    <img src={item.image} alt={item.name} className="img-fluid rounded img-thumbnali"/>
                                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                                </Col>
                                <Col md={3}><span>quantity:{item.quantity}</span></Col>
                                <Col md={3}>Rs{item.prices}</Col>
                                 </Row>
                                </ListGroup.Item>
                            })}
                        </ListGroup>
                        <Link to="/cart">Edit</Link>
                     </Card.Body>
                 </Card>
                </Col>
                <Col md={4}>
                    <Card className="sigin-card">
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Food</Col>
                                          <Col>Rs{cart.itemsPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                 <ListGroup.Item>
                                    <Row>
                                        <Col>Delivery</Col>
                                        <Col>Rs 3{cart.shippingPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                          <Col>Rs{cart.taxPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col><strong>Order Total</strong></Col>
                                          <Col>Rs{cart.totalPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <div className="d-grid">
                                   <Button type="button" onClick={placeOrderHandler} disabled={cart.cartItems.length===0} variant="danger">
                                    Place Order
                                   </Button>
                                   </div>
                                   {loading&&<LoadingBox/>}
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
