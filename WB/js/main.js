const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

const buttonCart=document.querySelector('.button-cart');
const modalCart=document.querySelector('#modal-cart');
const modalClose=document.querySelector('.modal-close')
const more=document.querySelector('.more');
const navigationItem=document.querySelectorAll('.navigation-link');
const longGoodsList=document.querySelector('.long-goods-list');
const cardTableGoods=document.querySelector('.cart-table__goods');
const cardTableTotal=document.querySelector('.card-table__total');
const cartCount=document.querySelector('.cart-count');


(function(){

	const scrollLinks=document.querySelectorAll('a.scroll-link');

	for (let i = 0; i < scrollLinks.length; i++) {
		scrollLinks[i].addEventListener('click',event=>{
			event.preventDefault();
			const id=scrollLinks[i].getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior:'smooth',
				block:'start'
			})
		});
	}
})()

const getGoods= async function(){
	const result=await fetch('db/db.json');
	if(!result.ok){
		throw "Ошибочка вышла" + result.status;
	}
	return result.json();
};

const cardGoods={
	goods:[
		
	],
	renderCart(){
		cardTableGoods.textContent='';
		this.goods.forEach(({id,name,price,count})=>{
			const trGood=document.createElement('tr');
			trGood.className='cart-item';
			trGood.dataset.id=id;
			trGood.innerHTML=`
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price*count}$</td>
				<td><button class="cart-btn-delete">x</button></td>

			`;
			cardTableGoods.append(trGood);
		});

		const total=this.goods.reduce((sum,item)=>{
			return sum+item.price*item.count;
		},0);

		cardTableTotal.textContent=total+"$";
	},

	deleteCart(id){
		this.goods=this.goods.filter(item=>id!=item.id);
		cartCount.textContent=cardGoods.goods.length;
		cardGoods.renderCart();
	},
	plusCart(id){
		for(const item of this.goods){
			if(item.id===id){
				item.count++;
				break;
			}
		};
		this.renderCart();
	},
	minusCart(id){
		for(const item of this.goods){
			if(item.id===id){
				if(item.count<=1){
					this.deleteCart(id);
					
				}else{
					item.count--;
				}
				break;
			}
		};
		this.renderCart();
	},

	addCart(id){
		const goodItem=this.goods.find(item=>item.id===id);
		if(goodItem){
			this.plusCart(id);
		}else{
			getGoods()
				.then(data=>data.find(item=>item.id===id))
				.then(({id,name,price})=>{
					this.goods.push({
						id,
						name,
						price,
						count:1
					});
					cartCount.textContent=(this.goods.reduce((acc,current,index)=>{
						return index+1;
					},0))
				});
		}
	}
} 

document.body.addEventListener('click',event=>{
	const addToCart=event.target.closest('.add-to-cart');
	if(addToCart.classList.contains('add-to-cart')){
		cardGoods.addCart(addToCart.dataset.id);
	}
})

cardTableGoods.addEventListener('click',event=>{
	const target=event.target;
	if(target.tagName==='BUTTON'){
		if(target.classList.contains('cart-btn-delete')){
			const id=target.closest('.cart-item').dataset.id;
			cardGoods.deleteCart(id);
		};
	
		if(target.classList.contains('cart-btn-plus')){
			const id=target.closest('.cart-item').dataset.id;
			cardGoods.plusCart(id);
		};
	
		if(target.classList.contains('cart-btn-minus')){
			const id=target.closest('.cart-item').dataset.id;
			cardGoods.minusCart(id);
		};
	}

})

buttonCart.addEventListener('click',()=>{
	cardGoods.renderCart();
	modalCart.classList.add('show');
});

modalClose.addEventListener('click',()=>{
	modalCart.classList.remove('show');

});



const createCard=function(objCard){
	const card=document.createElement('div');
	card.className='col-lg-3 col-sm-6';
	card.innerHTML=`
	<div class="goods-card">
		${objCard.label ? `<span class="label">${objCard.label}</span>`: ''}
		<img src="db/${objCard.img}" alt=${objCard.name} class="goods-image">
		<h3 class="goods-title">${objCard.name}</h3>
		<p class="goods-description">${objCard.description}</p>
		<button class="button goods-card-btn add-to-cart" data-id="${objCard.id}">
			<span class="button-price">$${objCard.price}</span>
		</button>
	</div>`
	return card;
};

const renderCards=function(data){
	longGoodsList.textContent='';
	const cards=data.map(createCard);
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
}

more.addEventListener('click',event=>{
	event.preventDefault();
	getGoods().then(
		result=>{
			renderCards(result);
		}
	);
	const id=more.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior:'smooth',
				block:'start'
			})
});

const filterCard=function(field,value){
	getGoods().then(data=>{
		const filterGoods=data.filter(good=>{
			if(value==='All'){
				return good;
			}else{
				return good[field]===value;
			}
			

		});
		return filterGoods;
	}).then(renderCards)
};

navigationItem.forEach(function(item){
	item.addEventListener('click',event=>{
		event.preventDefault();
		const field=item.dataset.field;
		const value=item.textContent;
		filterCard(field,value);
	})
});





