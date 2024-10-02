const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json')

initializeApp({
    credential: cert(serviceAccount)
})
const db = getFirestore();

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render('cadastrar')
})

app.post("/cadastrar", (req, res) => {
    const { nome, telefone, origem, data_contato, observacao } = req.body
    db.collection('clientes').add({
        nome: nome,
        telefone: telefone,
        origem: origem,
        data_contato: data_contato,
        observacao: observacao
    }).then((result) => {
        console.log('Dados cadastrados');
        console.log(result);
        res.redirect('/consulta')
    })

    
})
app.get("/consulta", (req, res) => {
    db.collection('clientes').get()
    .then((posts) => {
        const data = posts.docs.map((post) => {
            return {...post.data(), id: post.id}
        })
        console.log(data);
        
        res.render('consulta', {posts: data})
    }) 
    .catch((error) => {
        console.error('Não foi possivel buscar os dados', error);
    })
})

app.get('/editar/:id', (req, res) => {
    const { id } = req.params
    db.collection('clientes').doc(id).get()
    .then((post) => {
        console.log(post)
        const data = {...post.data(), id: post.id}
        console.log('Dta', data);
        
        res.render('editar', {posts: data})
    }) 
    .catch((error) => {
        console.error('Não foi possivel buscar os dados', error);
    })
})

app.post('/editar/:id', (req, res) => {
    const { nome, telefone, origem, data_contato, observacao } = req.body
    const { id } = req.params
    db.collection('clientes').doc(id).set({
        nome: nome,
        telefone: telefone,
        origem: origem,
        data_contato: data_contato,
        observacao: observacao
    }).then(() => {
        console.log('Dados atualizados');
        res.redirect('/consulta')
    })
})
app.get('/excluir/:id', (req, res) => {
    const { id } = req.params
    db.collection('clientes').doc(id).delete().then(() => {
        console.log('Dados deletados');
        res.redirect('/consulta')
    })
})

app.listen(8080, () => {
    console.log('Servidor funcionando');
})