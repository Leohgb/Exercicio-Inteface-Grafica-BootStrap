const express = require('express');
const app = express();
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const serviceAccount = require('./albuquerque-firebase-adminsdk-m0f1v-d88e4b906f.json')

const serviceAccount = require('./serviceAccountKey.json')

initializeApp({
    credential: cert(serviceAccount)
})
const db = getFirestore();

app.engine('handlebars', handlebars({
    helpers: {
        eq: function (v1, v2) {
            return v1 === v2
        }
    },
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render('cadastrar')
})

app.post("/cadastrar", (req, res) => {
    db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(() => {
        console.log("Dados cadastrados com sucesso!");
        res.send("Dados cadastrados com sucesso!");
    }).catch((error) => {
        console.error("Erro ao cadastrar: ", error);
        res.status(500).send("Erro ao cadastrar dados");
    });
})

app.get("/consulta", (req, res) => {
    db.collection('clientes').get()
        .then((posts) => {
            const data = posts.docs.map((post) => {
                return { ...post.data(), id: post.id }
            })
            console.log(data);

            res.render('consulta', { posts: data })
        })
        .catch((error) => {
            console.error('Não foi possivel buscar os dados', error);
        })
})

app.get('/editar/:id', async (req, res) => {
    const iduser = req.params.id;

    const clientesRef = db.collection('clientes').doc(iduser);
    const snapshot = await clientesRef.get();
    let datavalues = snapshot['_fieldsProto']

    res.render("editar", { posts: datavalues })
})

app.post("/atualizar/:id", (req, res) => {
    const id = req.params.id;

    const dadosAtualizados = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };
    db.collection('clientes').doc(id).update(dadosAtualizados)
        .then(() => {
            console.log("Dados atualizados com sucesso!");
            res.send("Dados atualizados com sucesso!");
        })
        .catch((error) => {
            console.error("Erro ao atualizar: ", error);
            res.status(500).send("Erro ao atualizar dados");
        });
});

app.get('/excluir/:id', (req, res) => {
    const id = req.params.id;

    db.collection('clientes').doc(id).delete()
        .then(() =>{
            console.log("Cliente excluído com sucesso!");
            res.send("Cliente excluído com sucesso!");
            res.redirect("/consulta")
        })
        .catch((error) => {
            console.error("Erro ao excluir cliente: ", error);
            res.status(500).send("Erro ao excluir cliente.");
        });
})

app.listen(8080, () => {
    console.log('Servidor funcionando');
})