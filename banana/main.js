document.addEventListener('DOMContentLoaded', () => {
  let cart = {};
  let productData = [];
  let couponApplied = false;
  const discount = 0.5;

  const cartQuantity = document.querySelector('.quantity');
  const cartItems   = document.querySelector('.cart-items');
  const cartTotal   = document.querySelector('.cart-total');
  const cartSummary = document.querySelector('.cart-summary');
  const emptyCart   = document.querySelector('.empty-content');
  const overlay     = document.querySelector('.overlay');
  const orderSummary= document.querySelector('.order-summary');

  const couponInput = document.getElementById('coupon');
  const couponMsg   = document.getElementById('coupon-message');

  fetch('data.json').then(r=>r.json()).then(data=>{
    productData=data;
    loadProducts();
  });

  function loadProducts(){
    const template=document.getElementById('product-template');
    productData.forEach(p=>{
      const c=template.cloneNode(true);
      c.id='';
      c.style.display='block';
      c.querySelector('.image-product').src=p.image;
      c.querySelector('.product-name').textContent=p.name;
      c.querySelector('.category').textContent=p.category;
      c.querySelector('.price').textContent=`$${p.price.toFixed(2)}`;

      const addBtn = c.querySelector('.addToCart');
      const counter= c.querySelector('.counter');
      const span   = counter.querySelector('span');

      addBtn.onclick = ()=>{ add(p, span, addBtn, counter); };
      counter.querySelector('.icon-increment').onclick = ()=>{ add(p, span); };
      counter.querySelector('.icon-decrement').onclick = ()=>{ removeOne(p, span, addBtn, counter); };

      document.querySelector('main').appendChild(c);
    });
  }

  function add(p, span, addBtn, counter){
    if(!cart[p.name]) cart[p.name]={...p, qty:0};
    cart[p.name].qty++;
    span.textContent=cart[p.name].qty;
    if(addBtn){ addBtn.style.display='none'; counter.classList.remove('hidden'); }
    updateCart();
  }

  function removeOne(p, span, addBtn, counter){
    if(cart[p.name]){
      cart[p.name].qty--;
      if(cart[p.name].qty<=0){
        delete cart[p.name];
        if(addBtn){ addBtn.style.display='inline-block'; counter.classList.add('hidden'); }
      }
      span.textContent=cart[p.name]?cart[p.name].qty:0;
      updateCart();
    }
  }

  function updateCart(){
    cartItems.innerHTML='';
    let totalQty=0, total=0;
    for(const [name,item] of Object.entries(cart)){
      totalQty+=item.qty;
      total+=item.qty*item.price;

      const div=document.createElement('div');
      div.className='cart-item';
      div.innerHTML=`${name} x${item.qty} - $${(item.qty*item.price).toFixed(2)}
        <button class="remove">x</button>`;
      div.querySelector('.remove').onclick=()=>{
        delete cart[name]; updateCart();
        document.querySelectorAll('.products-card').forEach(card=>{
          if(card.querySelector('.product-name').textContent===name){
            card.querySelector('.addToCart').style.display='inline-block';
            card.querySelector('.counter').classList.add('hidden');
            card.querySelector('.counter span').textContent='0';
          }
        });
      };
      cartItems.appendChild(div);
    }
    if(couponApplied) total*=discount;
    cartQuantity.textContent=totalQty;
    cartTotal.textContent=`$${total.toFixed(2)}`;
    emptyCart.style.display= totalQty>0?'none':'block';
    cartSummary.style.display= totalQty>0?'block':'none';
  }

  // Coupon
  document.getElementById('apply-coupon').onclick = ()=>{
    if(couponInput.value.trim().toLowerCase()==='hello'){
      couponApplied=true;
      couponMsg.style.color='green';
      couponMsg.textContent='Coupon applied (50% off)';
    }else{
      couponApplied=false;
      couponMsg.style.color='red';
      couponMsg.textContent='Invalid coupon';
    }
    updateCart();
  };

  // Confirm order & send email
  document.querySelector('.confirm-order').onclick = ()=>{
    const userEmail=document.getElementById('userEmail').value.trim();
    if(!userEmail){ alert('Enter your email.'); return; }

    let orderText='';
    let total=0;
    for(const [n,i] of Object.entries(cart)){
      orderText+=`${n} x${i.qty} = $${(i.qty*i.price).toFixed(2)}\n`;
      total+=i.qty*i.price;
    }
    if(couponApplied) total*=discount;
    orderText+=`\nTOTAL: $${total.toFixed(2)}`;

    fetch('sendOrder.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({customerEmail:userEmail, order:orderText})
    });

    orderSummary.textContent = orderText;
    overlay.style.display='flex';
  };

  document.querySelector('.start-new-order').onclick = ()=>{
    cart={}; couponApplied=false;
    updateCart();
    overlay.style.display='none';
  };
});
