//------Recuperation du panier (Local Storage)
let cart = JSON.parse(localStorage.getItem("panier"));

// Retourner les caracteristiques du produit de l'API
async function getProductData(id) {
    try {
        // interroger l'api
        let response = await fetch(`http://localhost:3000/api/products/${id}`);
        // convertion de la reponse au format json    
        return await response.json();
        }
    catch (e) {
        console.log("Erreur lors de l'appel du serveur " + e);
        alert("Erreur lors de l'appel du serveur ");
    };
};


//------------------------------------------------------------//
//-------------------CALCULS RECAPITULATIF-------------------//

// Calcul du recapitulatif
async function totalAmount() {
    // si le panier n'est pas vide
    if (!cart == 0) {
        //---variables
        // total des articles
        let quant = 0;
        // montant total
        let amount = 0;

        //---operations
        for (let item of cart) {
            // quantite s'accumule
            quant += Number(item.quantity);
            
            let data = await getProductData(item.productId);
            // prix X quantite
            add = item.quantity * data.price;
            // le prix s'accumule
            amount += add;
        };

        //---injection du rendu dans l'html
        document.getElementById('totalQuantity').innerHTML = quant;
        document.getElementById('totalPrice').innerHTML = amount;
    }
};

//------Fonction du message : panier vide
function emptyCart() {
    //---------On cache la section CART
    document.querySelector('.cart').hidden = true;

    //---------Affiche un message
    //---Modifier le Titre
    let title = document.querySelector('h1');
    title.textContent = "Votre panier est vide...";
    title.style.marginBottom = '40px';

    //---Ajouter un commentaire
    // creer un nouvel element html dans la div #cartAndFormContainer
    const newElt = document.createElement("h2");
    let titleBloc = document.querySelector('#cartAndFormContainer');
    let commentary = titleBloc.appendChild(newElt);
    // edition de l'element
    commentary.textContent = "Choississez des articles dans notre collection !";
    commentary.style.textAlign = 'center';
}

//------Conditions
// si le panier existe
if (JSON.parse(localStorage.getItem("panier"))) {
    if (cart == 0) {
        // cache le formulaire et affiche un message
        emptyCart();

    } else {
        //---recalculer quantite et montant
        totalAmount();
    }

    // si le panier n'existe pas
} else if (!JSON.parse(localStorage.getItem("panier"))) {
    // on cree le panier pour envoyer directement
    cart = [];
    localStorage.setItem("panier", JSON.stringify(cart));
    // cache le formulaire et affiche un message
    emptyCart();
}

//-------------------FIN calcul recapitulatif---------------//
//---------------------------------------------------------//
//-------------------AFFICHAGE PRODUITS-------------------//
(async function displayCart() {
    //---creation du rendu
    let render = '';
    for(let item of cart) {
        // Si la quantite de l'article est entre 1 et 100
        if (item.quantity >= 1 && item.quantity <= 100) {
            // on laisse la quantite intacte
            item.quantity = item.quantity;

        // Si la quantite de l'article est superieur a 100
        } else if (item.quantity > 100) {
            // remettre a 100
            item.quantity = 100;
            // envoyer dans le Local Storage
            localStorage.setItem("panier", JSON.stringify(cart));

        // Si la quantite de l'article est inferrieur a 1
        } else {
            // remettre a 1
            item.quantity = 1;
            // envoyer dans le Local Storage
            localStorage.setItem("panier", JSON.stringify(cart));
        };

        //------Rendu HTML
        let data = await getProductData(item.productId);
        let htmlContentItem = `
            <article class="cart__item" data-id="${item.productId}" data-color="${item.color}">
                <div class="cart__item__img">
                    <img src="${data.imageUrl}" alt="${data.altTxt}">
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${data.name}</h2>
                        <p>${item.color}</p>
                        <p>${data.price} €</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : </p>
                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item.quantity}">
                        </div>
                        <div class="cart__item__content__settings__delete">
                            <p class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>
        `;
        // Stocker le rendu en memoire
        render = render + htmlContentItem;
    };
    //---injection du rendu dans l'html
    document.getElementById('cart__items').innerHTML = render;

    //-------------------------------------------//
    //------------Suppression article-----------//
    (function delCartItem() {
        //---lister les bouttons de suppression
        let delButtons = document.querySelectorAll("p.deleteItem");

        //---Supprimer l'element cible
        delButtons.forEach(item => {
            item.addEventListener("click", (event) => {
                // bloquer les evenements par defaut
                event.preventDefault();

                //---Identifier les elements            
                // pointer l'element a supprimer (element DOM)
                let article = item.closest('article');
                // retourner l'id et color de la cible (element DOM)
                const delId = article.dataset.id;
                const delColor = article.dataset.color;
                // trouver de l'index du prodduit (tableau du document)
                // grace a l'id et de la couleur
                const index = cart.findIndex(e => e.productId === delId && e.color === delColor);

                //-----Modification du Local Sorage
                // retire du tableau (document)
                cart.splice(index, 1);
                // envoyer dans le Local Storage
                localStorage.setItem("panier", JSON.stringify(cart));

                // Si le panier est vide
                if (cart == 0) {
                    // retire le formulaire et affiche un message
                    emptyCart();
                }

                //---suppression dans le DOM
                article.remove();
                //---recalculer quantite et montant
                totalAmount();
            });
        });
    })();

    //------------------------------------------//
    //------------Modifier quantite------------//
    (function modifyCartItem() {
        //lister les input de quantite
        let quantButtons = document.querySelectorAll("input.itemQuantity");

        //---Modifier l'element cible
        quantButtons.forEach(item => {
            item.addEventListener("change", (event) => {
                // bloquer les evenements par defaut
                event.preventDefault();

                //---Identifier les elements
                // pointer l'element a modifier (element DOM)
                let article = item.closest('article');
                // retourner l'id et color de la cible (element DOM)
                const quantId = article.dataset.id;
                const quantColor = article.dataset.color;

                // trouver de l'index du prodduit (tableau du document)
                // grace a l'id et de la couleur
                const index = cart.findIndex(e => e.productId === quantId && e.color === quantColor);

                //------Modification du Local Sorage
                // si la quantite enregistree est comprise entre 1 et 100
                if (item.value >= 1 && item.value <= 100) {
                    // modification du tableau (document)
                    cart[index].quantity = item.value;
                    // envoyer dans le Local Storage
                    localStorage.setItem("panier", JSON.stringify(cart));

                    // recalculer quantite et montant
                    totalAmount();

                    // si la quantite enregistree n'est pas comprise entre 1 et 100
                } else {
                    // Message erreur
                    alert("Veuillez indiquer une quantite entre 1 et 100");
                };
            });
        });
    })();
})();


//-------------------FIN gestion panier-----------------------------//
//-----------------------------------------------------------------//
//-------------------VALIDATION DES DONNEES-------------------//


// variables qui pointent les elements du DOM
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const address = document.getElementById("address");
const city = document.getElementById("city");
const email = document.getElementById("email");

// variables qui permettent la recuperation des valeurs des formulaires
let firstNameInput, lastNameInput, addressInput, cityInput, emailInput;

//------VALIDATION prenom
firstName.addEventListener('change', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    // recuperation de la saisie utilisateur
    let input = firstName.value;
    // definition de l'expression reguliere : uniquement des lettres, une majuscule au debut, puis des minuscules
    //let regex = new RegExp(/^([a-zA-Z]{2,26})(\s[a-zA-Z]{2,26})?(-[a-zA-Z]{2,26})?$/, 'g');
    let regex = new RegExp(/^([a-zA-Z]{2,26})(-[a-zA-Z]{2,26})?(\s[a-zA-Z]{2,26})?$/)
        //---Controle de la saisie
        // si la sasie est valide
    if (regex.test(input)) {
        // On affiche un signe d'approbation
        document.getElementById('firstNameErrorMsg').textContent = '🗸';
        return firstNameInput = true;
        // si la saisie est incorrecte
    } else {
        // On affiche un message d'erreur
        document.getElementById('firstNameErrorMsg').innerHTML = "Votre prenom doit comporter 2 caracteres minimum, avec  une majuscule suivit de minuscules:<br/>Paul, Marie-Louise, Jose Antonio ...";
        return firstNameInput = false;
    };
});
//------FIN prenom

//------VALIDATION nom de famille
lastName.addEventListener('change', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    // recuperation de la saisie utilisateur
    let input = lastName.value;
    // definition de l'expression reguliere : uniquement des lettres, une majuscule au debut, puis des minuscules
    let regex = new RegExp(/^([a-zA-Z]{1,3}\s)?([a-zA-Z]{1,3}[']{1})?([a-zA-Z]{2,26})(\s[a-zA-Z]{2,26})?(-[a-zA-Z]{2,26})?(\s[a-zA-Z]{2,26})?$/, 'g');

    //---Controle de la saisie
    // si la sasie est valide
    if (regex.test(input)) {
        // On affiche un signe d'approbation 
        document.getElementById('lastNameErrorMsg').textContent = '🗸';
        return lastNameInput = true;
        // si la saisie est incorrecte
    } else {
        // On affiche un message d'erreur
        document.getElementById('lastNameErrorMsg').innerHTML = "Votre nom de famille doit comporter 2 caracteres minimum, avec une majuscule suivit de minuscules :<br/>Dupont, D'Artagnan, De Sade, Primo De Rivera ...";
        return lastNameInput = false;
    };
});
//------FIN nom de famille

//------VALIDATION adresse
address.addEventListener('change', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    // recuperation de la saisie utilisateur
    let input = address.value;
    // definition de l'expression reguliere : uniquement des lettres, une majuscule au debut, puis des minuscules, limite a 20 lettres
    let regex = new RegExp(/^([0-9]{1,6})\s([a-zA-Z]{2,12})(\s[a-zA-Z]{2,12})?(\s[a-zA-Z]{2,12})?\s([a-zA-Z]{2,26})(-[a-zA-Z]{2,12})?(\s[a-zA-Z]{2,12})?([-']{1}[a-zA-Z]{2,12})?(\s[a-zA-Z]{2,12})?([-']{1}[a-zA-Z]{2,12})?$/, 'g');

    // controle de la saisie
    // si la sasie est valide
    if (regex.test(input)) {
        // On affiche un signe d'approbation 
        document.getElementById('addressErrorMsg').textContent = '🗸';
        return addressInput = true;
        // si la saisie est incorrecte
    } else {
        // On affiche un message d'erreur
        document.getElementById('addressErrorMsg').innerHTML = "Votre adresse doit comporter un numero suivit de caracteres :<br/>12 rue Thiers, 12035 boulevard de Ledru-Rollin, 8 chemin Beauvoir Chostakovitch ...";
        return addressInput = true;
    };
});
//------FIN adresse

//------VALIDATION ville
city.addEventListener('change', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    // recuperation de la saisie utilisateur
    let input = city.value;
    // definition de l'expression reguliere : uniquement des lettres, une majuscule au debut, puis des minuscules, limite a 20 lettres
    let regex = new RegExp(/^([a-zA-Z]{2,26})([-']{1}[a-zA-Z]{2,26})?(\s[a-zA-Z]{2,26})?([-']{1}[a-zA-Z]{2,26})?(\s[a-zA-Z]{2,26})?([-']{1}[a-zA-Z]{2,26})?$/, 'g');

    //---controle de la saisie
    // si la sasie est valide
    if (regex.test(input)) {
        // On affiche un signe d'approbation 
        document.getElementById('cityErrorMsg').textContent = '🗸';
        return cityInput = true;
        // si la saisie est incorrecte
    } else {
        // On affiche un message d'erreur
        document.getElementById('cityErrorMsg').innerHTML = "Votre ville doit comporter 2 caracteres minimum, avec une majuscule suivit de minuscules :<br/> Paris, Pau, Saint-Germain-En-Laye...";
        return cityInput = false;
    };
});
//------FIN ville

//------VALIDATION email
email.addEventListener('change', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    // recuperation de la saisie utilisateur
    let input = email.value;
    // definition de l'expression reguliere : uniquement des lettres, une majuscule au debut, puis des minuscules, limite a 20 lettres
    let regex = new RegExp(/^([a-z0-9._-]+)@([a-z0-9]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/, 'g');

    // controle de la saisie
    // si la sasie est valide
    if (regex.test(input)) {
        // On affiche un signe d'approbation 
        document.getElementById('emailErrorMsg').textContent = '🗸';
        return emailInput = true;
        // si la saisie est incorrecte
    } else {
        // On affiche un message d'erreur
        document.getElementById('emailErrorMsg').textContent = "Votre email ne doit comporter que des chiffres et des lettres minuscules : alix93@gmail.com, sasha.dupont@yahoo.fr, kanap-service_client@kanap.co.fr ...";
        return emailInput = false;
    };
});
//------FIN email


//-------------------FIN validation des formulaires---------//
//---------------------------------------------------------//
//-------------------ENVOI DE LA SAISIE-------------------//

// Modele d'objet pour les donnees de contact
class contactInfos {
    constructor(firstName, lastName, address, city, email) {
        this.firstName = firstName,
            this.lastName = lastName,
            this.address = address,
            this.city = city,
            this.email = email
    }
};

//---------Boutton de commande
// pointer le boutton (DOM)
const orderButton = document.getElementById('order');

// Lorsque le boutton est clique
orderButton.addEventListener('click', (event) => {
    // bloquer les evenements par defaut
    event.preventDefault();

    //------Conditions
    // si les valeurs du formulaire sont valides
    if (firstNameInput === true && lastNameInput === true && addressInput === true && cityInput === true && emailInput === true) {
        // Creation de l'objet contenant les renseignements
        let contact = new contactInfos(
            firstName.value,
            lastName.value,
            address.value,
            city.value,
            email.value
        );

        //---Recuperation des id's des produts pour creer un tableau d'Id's
        let products = [];
        cart.forEach(item => {
            products.push(item.productId)
        });

        //---Requete POST sur l'API et redirection
        sendOrder(contact, products);

        // si les valeurs du formulaire ne sont pas valides
    } else {
        // Message d'erreur
        alert("Veuillez remplir correctement chaque champs");
    };
});


//---------Fonction pour requeter l'API et rediriger sur la page de commande
function sendOrder(contact, products) {

    fetch("http://localhost:3000/api/products/order", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: contact, products: products })
        })
        .then(function(res) {
            if (res.ok) {
                return res.json();
            }
        })
        .then(function(value) {
            linkOrder = "./confirmation.html?orderId=" + value.orderId;
            document.location.href = linkOrder;
        });

};