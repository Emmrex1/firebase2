// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
   remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth,

  // Create and loging With Email & Password
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,

  // Google Authentication
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKODVgQtyVH-HKnL9BBEBq1AEqZ_qDaV8",
    authDomain: "emmrex-e-commerce.firebaseapp.com",
    databaseURL: "https://emmrex-e-commerce-default-rtdb.firebaseio.com",
    projectId: "emmrex-e-commerce",
    storageBucket: "emmrex-e-commerce.appspot.com",
    messagingSenderId: "632681149751",
    appId: "1:632681149751:web:53cc3176e269ee2777d6b2",
    measurementId: "G-F0EBSNZN67"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// const appleProvider = new firebase.auth.OAuthProvider('apple.com');

let productId = document.getElementById("productId");
let ProductName = document.getElementById("productName");
let ProductCategory = document.getElementById("productCategory");
let ProductPrice = document.getElementById("productPrice");
let ProductImage = document.getElementById("productImage");
let submtBttn = document.getElementById("submtBttn");
let ProductForm = document.getElementById("form");
let ProductReview = document.getElementById("productReview");
let SelectedImage = "";
let headingText = document.getElementById("addProd");
let productList = document.getElementById("productList");
let userProductList = document.getElementById("userproductList");
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let Email = document.getElementById("email");
let Password = document.getElementById("password");
let signBttn = document.getElementById("signUpUser");
let signInBttn = document.getElementById("signInUser");
let signinEmail = document.getElementById("signemail");
let signoinPass = document.getElementById("signpassword");
let welcomeMessage = document.getElementById("welcomeMessage");
let SignWithGglBttn = document.getElementById("signInwithGgl");
let SignWithAppBttn = document.getElementById("signInwithApple");
let subscribeBtn = document.getElementById("subscribeBtn");
let BooknowBtn = document.getElementById("booknowBtn");
let messageDiv = document.getElementById('message');

if (ProductImage) {
    ProductImage.addEventListener("change", function (ev) { 
        let file = ev.target.files[0];
        let reader = new FileReader();
        reader.onloadend = () => {
            console.log("Selected Image: ", reader.result);
            SelectedImage = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

if (submtBttn) {
    submtBttn.addEventListener("click", function (ev) { 
        ev.preventDefault();
      
        let ProductDetails = {
            ProductName: ProductName.value,
            ProductPrice: ProductPrice.value,
            ProductReview: ProductReview.value,
            ProductCategory: ProductCategory.value,
            ProductImage: SelectedImage,
        };
        console.log("product Id : ", productId.value)
        if (productId.value) {
            // Update existing product
            update(ref(db, "product/" + productId.value), ProductDetails)
                .then(() => {
                    alert("Product Updated Successfully");
                    ProductForm.reset();
                    productId.value = "";
                    loadProducts();
                })
                .catch((error) => {
                    console.log("Error Updating Product: ", error);
                });
        } else {
            // Add new product
            set(ref(db, "product/" + ProductDetails.ProductName), ProductDetails)
                .then(() => {
                    alert("Product Uploaded Successfully");
                    ProductForm.reset();
                    loadProducts();
                })
                .catch((error) => {
                    console.log("Error Posting Product: ", error);
                });
        }
    });
}

function loadProducts() {
    let ProductArray = [];
    const productRef = ref(db, "product/");
    onValue(productRef, (data) => {
        const productData = data.val();
        console.log("Received Product: ", productData);
        if (productList) {
            productList.innerHTML = ''; 
        }
        if (userProductList) {
            userProductList.innerHTML = '';
        }
        for (let key in productData) {
            ProductArray.push(productData[key]);
            let productCard = document.createElement('div');
            productCard.className = 'col-md-3 mb-4 d-flex';
            productCard.innerHTML = `
                <div class="card flex-grow-1">
                    <img src="${productData[key].ProductImage}" class="img-fluid" alt="${productData[key].ProductName}" style="width: 250px; height: 200px; shadow-lg mx-auto">
                    <div class="d-flex flex-column">
                        <h5 class="text-center">${productData[key].ProductName}</h5>
                        <p class="text-center">${productData[key].ProductCategory}</p>
                        <p class="text-center">&#128178;${productData[key].ProductPrice}</p>
                        <p class="text-center"> &#127775; &#127775;&#127775;&#127775;&#127775;</p>
                        ${productList ? `
                        <div class="mt-auto mx-auto">
                            <button class="btn btn-success" onclick="window.editProduct('${key}')">Edit</button>
                            <button class="btn btn-danger" onclick="window.deleteProduct('${key}')">Delete</button>
                        </div>` : ''}
                        ${userProductList ? `
                            <button type="button" class="btn btn-success w-50 mx-auto mt-2" data-bs-toggle="modal" data-bs-target="#cartModal" onclick="addToCart('${key}')">Add to Cart</button>
                        </div>
                </div>` : ''}
            `;

            if (productList) {
                productList.appendChild(productCard);
            }
            if (userProductList) {
                userProductList.appendChild(productCard);
            }
        }
        console.log("Product Array: ", ProductArray);
    });
}

window.onload = loadProducts;

let cart = []; // Correctly initialize cart array

window.addToCart = function addToCart(productId) {
    const productRef = ref(db, "product/" + productId);
    get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();
            cart.push(product); // Push product object to the cart array
            updateCartCount();
            displayCartModal();
            alert(`${product.ProductName} has been added to the cart!`);
        } else {
            console.log("No data available for the product:", productId);
        }
    }).catch((error) => {
        console.error("Error fetching product data:", error);
    });
};

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    cartCount.innerText = cart.length;
}

window.displayCartModal = function displayCartModal() {
    const cartModalBody = document.getElementById('cartModalBody');
    cartModalBody.innerHTML = '';

    cart.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'cart-item';
        productDiv.innerHTML = `
            <div class=" align-items-center">
                <img src="${product.ProductImage}" class="img-fluid mx-5" alt="${product.ProductName}" style="width: 300px; height: 200px;">
                <div class="ms-3">
                <h5 class="text-center">${product.ProductName}</h5>
                <p class="text-center">&#128178;${product.ProductPrice}</p>
                </div>
                <button class="btn btn-danger ms-auto" onclick="removeFromCart(${index})">Remove</button>
                <button type="button" class="btn btn-success w-50 mx-5">Add to Cart</button>
            </div>
            <hr>
        `;
        cartModalBody.appendChild(productDiv);
    });
}

window.removeFromCart = function removeFromCart(index) {
    cart.splice(index, 1); // Remove the product from the cart array
    updateCartCount();
    displayCartModal();
    alert('Product has been removed from the cart!');
}

 window.editProduct = function editProduct(productId) {
    const productRef = ref(db, "product/" + productId);
       headingText.textContent = "Update Product";
        submtBttn.textContent = "Update ";
    get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();
            ProductName.value = product.ProductName;
            ProductPrice.value = product.ProductPrice;
            ProductReview.value = product.ProductReview;
            ProductCategory.value = product.ProductCategory;
            SelectedImage = product.ProductImage;
            document.getElementById("productId").value = productId;
        } else {
            console.log("No data available for the product:", productId);
        }
    }).catch((error) => {
        console.error("Error fetching product data:", error);
    });
}

window.deleteProduct = function deleteProduct(productId) {
    console.log("Product Clicked : ", productId);
    const productRef = ref(db, "product/" + productId);
    remove(productRef)
        .then(() => {
            alert("Product Removed Successfully");
            loadProducts();
        })
        .catch((error) => {
            console.log("Error Deleting Product: ", error);
        });
}


  
  // Sign Up
  signBttn?.addEventListener("click", function () {
    const userDetails = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: Email.value,
      password: Password.value,
    };
    if (userDetails.password.length < 8) {
      return alert("Password should be at least 8 characters");
    }
    console.log("User Details : ", userDetails);
    createUserWithEmailAndPassword(auth, userDetails.email, userDetails.password)
      .then((userCredential) => {
        // User created
        console.log("User Created : ", userCredential.user);
        alert("User Signed Up Successfully");
  
        // Update the user profile
        return updateProfile(userCredential.user, {
          displayName: `${userDetails.firstName} ${userDetails.lastName}`,
        });
      })
      .then(() => {
        // Profile updated
        console.log("Profile updated");
  
         window.location.href = "sign-in.html";
      })
      .catch((error) => {
        console.log("Error Creating User : ", error);
        if (error.message.includes("auth/email-already-in-use")) {
          alert("Email Already In Use, Try Logging in");
        }
      });
  });
  
  signInBttn?.addEventListener("click", function () {
    const userDetails = {
      email: signinEmail.value,
      password: signoinPass.value,
    };
    signInWithEmailAndPassword(auth, userDetails.email, userDetails.password)
      .then((user) => {
        console.log("User Signed In : ", user);
        alert("User Signed In Successfully");
        window.location.href = "../User2/Userfile.html";
      })
      .catch((error) => {
        console.log("Error Signing In : ", error);
        // If user details is not valid it throws this error
        if (error.message.includes("auth/invalid-credential")) {
          alert("User not found, try creating an account");
        }
        if (error.message.includes("auth/network-request-failed")) {
            alert("Network request fail, try connecting again");
          }
      });
  });
  function handleAuthAndLoadProducts() {
    // Check authentication state
    onAuthStateChanged(auth, (user) => {
        console.log("Currently Signed User : ", user);
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (user) {
            welcomeMessage.innerHTML = `Welcome ${user.displayName} to your dashboard`;
            // Load products when authenticated
            loadProducts();
        } else {
            welcomeMessage.innerHTML = `Welcome to your dashboard`;
            // Handle case when user is not authenticated (optional)
        }
    });
}

// Ensure the window.onload event is set to call the function when the page loads
window.onload = handleAuthAndLoadProducts;
   
SignWithGglBttn?.addEventListener('click', () => {
    SignWithGglBttn.disabled = true;

   signInWithPopup(auth, provider)
       .then((result) => {
           const credential = GoogleAuthProvider.credentialFromResult(result);
           const token = credential.accessToken;
           const user = result.user;
           window.location.href = "../User2/Userfile.html";
       })
       .catch((error) => {
           // Handle Errors here.
           const errorCode = error.code;
           const errorMessage = error.message;
           const email = error.customData ? error.customData.email : "unknown";
           const credential = GoogleAuthProvider.credentialFromError(error);

           console.error("Error with Google sign-in:", errorMessage);
           alert(`Error with Google sign-in: ${errorMessage}`);
           SignWithGglBttn.disabled = false;  // Re-enable the button on error
       });
});

// SignWithAppBttn?.addEventListener('click', () => {
//     SignWithAppBttn.disabled = true;

//     signInWithPopup(appleProvider)
//         .then((result) => {
//             const credential = OAuthProvider.credentialFromResult(result);
//             const token = credential.accessToken;
//             const user = result.user;
//             window.location.href = "../User2/Userfile.html";
//         })
//         .catch((error) => {
//             // Handle Errors here.
//             // const errorCode = error.code;
//             // const errorMessage = error.message;
//             // const apple = error.customData ? error.customData.apple : "unknown";
//             // const credential = OAuthProvider.credentialFromError(error);
 
//             console.error("Error with Apple sign-in:", errorMessage);
//             alert(`Error with Apple sign-in: ${errorMessage}`);
//             SignWithAppBttn.disabled = false;  // Re-enable the button on error
//         });

// });




// Function to sign out the user and redirect to homepage
function signOutAndRedirect(event) {
    event.preventDefault(); // Prevent default behavior
    auth.signOut().then(() => {
        console.log('User signed out');
        // Redirect to homepage
        window.location.href = '../Admin/Mydass.html';
    }).catch((error) => {
        console.error('Sign Out Error', error);
    });
}
loadProducts();
handleAuthAndLoadProducts();

// Ensure the window.onload event is set to call the function when the page loads
window.onload = function() {
    // Attach sign-out function to sign-out button
    const signOutButton = document.getElementById('signOutButton');
    if (signOutButton) {
        signOutButton.addEventListener('click', signOutAndRedirect);
    }
};

function countdown() {
    let countDownDate = new Date("December 30, 2024 00:00:00").getTime();
  
    let x = setInterval(function() {
      // Get today's date and time
      let now = new Date().getTime();
      
      let distance = countDownDate - now;
      
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      document.getElementById("days").innerHTML = days;
      document.getElementById("hours").innerHTML = hours;
      document.getElementById("minutes").innerHTML = minutes;
      document.getElementById("seconds").innerHTML = seconds;
      
      if (distance < 0) {
        clearInterval(x);
        document.querySelector(".countdown").innerHTML = "EXPIRED";
      }
    }, 1000);
  }
  window.onload = countdown;

  booknowBtn.addEventListener('click', function() {
    let email = document.getElementById('email1').value;
    if (email) {
      messageDiv.textContent = 'Successfully booked with email: ' + email;
      messageDiv.style.color = 'green';
      document.getElementById('email1').value = '';
    } else {
      messageDiv.textContent = 'Please enter a valid email address.';
      messageDiv.style.color = 'red';
    }
  });
  
  subscribeBtn.addEventListener('click', function() {
    let email = document.getElementById('email').value;
    if (email) {
      messageDiv.textContent = 'Subscribed successfully with email: ' + email;
      messageDiv.style.color = 'green';
      document.getElementById('email').value = '';
    } else {
      messageDiv.textContent = 'Please enter a valid email address.';
      messageDiv.style.color = 'red';
    }
  });
