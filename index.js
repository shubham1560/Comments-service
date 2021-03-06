const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const axios = require('axios');
const cors = require('cors')

const app = express()
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res)=>{
    res.send(commentsByPostId[req.params.id] || []);
})

app.post('/posts/:id/comments', async (req, res)=>{
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({id: commentId, content, status:"pending"});
    commentsByPostId[req.params.id] = comments;  
    res.status(201).send(comments);

    await axios.post('http://localhost:4005/events', {
        'type': "CommentCreate",
        'data': {
            "postId": req.params.id,
            "id": commentId,
            "comment": content
        }
    })

    await axios.post('http://localhost:4003/events', {
        'type': 'CommentCreate',
        'data': {
            "postId": req.params.id,
            "id": commentId,
            "comment": content,
            // "status": "pending"
        }
    })
})

app.post('/events', (req, res) => {
    console.log(req.body);
});

app.listen(4001, ()=>{
    console.log("comments running on port 4001");
})