const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')

var admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
const db = getFirestore();

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render('index')
})

app.post("/cadastrar", (req, res) => {
    const { nome, telefone, origem, data_contato, observacao } = req.body
    var result = db.collection('clientes').add({
        nome: nome,
        telefone: telefone,
        origem: origem,
        data_contato: data_contato,
        observacao: observacao
    }).then(() => {
        console.log('Dados cadastrados');

    }).catch((e)=>{
        console.log(e)
    })

    console.log(result);

})
app.get("/consulta", (req, res) => {
    db.collection('clientes').get()
        .then((posts) => {
            const data = posts.docs.map((post) => {
                return post.data()
            })
            console.log(data);

            res.render('consulta', { posts: data })
        })
        .catch((error) => {
            console.error('Não foi possivel buscar os dados', error);
        })
})


app.listen(8080, () => {
    console.log('Iniciando...');
})