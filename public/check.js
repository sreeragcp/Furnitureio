////address selection/////
let selectedAddressId = document.getElementById('addressId').value
console.log(selectedAddressId)

const addressRadios = document.querySelectorAll('input[name="selectedAddress"]');
const paymentRadios = document.querySelectorAll(".payment-radio");
const placeOrderBtn = document.getElementById("place-order-btn");


const toPayment = async () => {
    console.log('inside topayment')
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked').value
    console.log(selectedAddress,13)
    const loadPayment = await fetch(`/loadPayment?addressId=${selectedAddress}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if(loadPayment){
        window.location.href = '/paymentDetails';  
    }
}

// const toReview = async () => {
//     console.log('inside toreview')
//     const selectedPayment = document.querySelector('input[name="payment"]:checked').value
//     console.log(selectedPayment);
//     const loadPayment = await fetch(`/toReview?payment=${selectedPayment}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })

//     if(loadPayment){
//         window.location.href = '/orderReview';  
//     }
// }

addressRadios.forEach((radio) => {
    radio.addEventListener("change", handleAddressSelection);
});

paymentRadios.forEach((radio) => {
    radio.addEventListener("change", handleAddressSelection);
});



function handleAddressSelection() {
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    const selectedPayment = document.querySelector(".payment-radio:checked");
    const placeOrderBtn = document.getElementById("place-order-btn");

    if (selectedAddress && selectedPayment) {
        placeOrderBtn.disabled = false;
    } else {
        placeOrderBtn.disabled = true;
    }
}


const placeOrderButton = document.querySelector('#place-order-btn')

// let couponEl
// let newTotal
// let subTotal
//  let updateWallet

console.log('payment-option1')

const paymentOption = document.querySelectorAll('input[name="payment"]');
let paymentMethod = null;
console.log(paymentOption.length + 'this is in the payment option')
paymentOption.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            paymentMethod = checkbox.value
            console.log("User selected " + checkbox.value);
            console.log(paymentMethod, 'ithanu nee ippo select cheytha payment method')
        } else {
            console.log("User unchecked " + checkbox.value);
        }
    });
});
const placeOrder = () => {

    const useWallet = async () => {

        const wallet = parseInt(document.getElementsByName('Wallet')[0].value)
        console.log(wallet, 'this is your wallet amouont')
        let subTotal = parseInt(document.querySelector('.totalValue').value)
        console.log(wallet, 'um pinna total amount ivide ind', subTotal)

        if (subTotal < wallet) {
            console.log('true')
            console.log('entering inside wallet')
            updateWallet = parseInt(wallet - subTotal)
            console.log(updateWallet)
            if (updateWallet) {
                Cod()
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'wallet is not updated server side problem',
                    footer: '<a href="">Why do I have this issue?</a>'
                })
            }

        } else {
            //       alertify.set('notifier', 'position', 'bottom-center');
            alertify.success('you dont have sufficient balance in ur wallet choose another payment method')
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                footer: '<a href="">Why do I have this issue?</a>'
            })
        }
    }
}