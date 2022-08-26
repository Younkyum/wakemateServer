// index.js 

const { application } = require('express');
const express = require('express');
const db = require('./config/db');
const app = express();

app.use(express.json())
app.use(express.urlencoded( {extended: false} ))


//GET

app.get('/', function (req, res) { // MAIN
    return res.send('Hello World')
});

app.get(`/users`, function (req, res) { // View All User
    db.query(`SELECT * FROM user;`, (err, data) => {
        if (!err) res.send({ data });
        else res.send(err);
    })
})

app.get(`/user`, function (req, res) { // User Search
    db.query(`SELECT * FROM user WHERE user_id=?;`, [req.query.id], (err, data) => {
        if (!err) res.send(data);
        else res.send(err)
    })
})

app.get(`/team`, function (req, res) { // All of Team Users
    const all_data = {team: undefined, members: undefined}
    db.query(`SELECT * FROM team WHERE team_id=?;`, [req.query.id], (err, data) => {
        if (!err) {
            all_data.team = data
            db.query(`SELECT * FROM user WHERE user_team_id=?`, [req.query.id], (err, data) => {
                if (!err) {
                    all_data.members = data
                    res.send(all_data)
                }
                else {
                    res.send(err)
                }
            })
        }
        else res.send(err)
    })  
})

app.get(`/team/rank`, function (req, res) {
    db.query('select * from team order by rank_of_team;', (err, rank) => {
        if (!err) {
            res.send({rank})
        } else {
            res.send(err)
        }
    })
})


// POST



app.post(`/user/wake`, function (req, res) { // Make User Wake
    db.query(`UPDATE user SET is_wake_up=? WHERE user_id=?;`, [req.body.is_wake_up, req.body.user_id], (err, data) => { // WAKE UP 여부 확인
        if (err) res.send(err)
        else {
            if (req.body.user_id) {
                db.query(`SELECT * FROM user WHERE user_id=?;`, [req.body.user_id], (err, data) => { // WAKE UP 수정 후 JSON으로 다시 전송
                    if (!err) res.send(data)
                    else res.send(err)
                })
            }
        }
    })  
})

app.post(`/team/quit`, function (req, res) { // Make User quit the Team
    db.query(`UPDATE user SET user_team_id=0 WHERE user_id=?;`, [req.body.user_id], (err, data) => {
        if (err) res.send(err)
        else {
            db.query(`SELECT * FROM user WHERE user_id = ?;`, [req.body.user_id], (err, data) => {
                if (!err) res.send(data)
                else res.send(err)
            })
        }
    })
})

app.post(`/team/add`, function (req, res) { // Add Team User (Only for admin)
    db.query(`SELECT * FROM team WHERE team_id=?;`, [req.body.team_id], (err, data1) => {
        if (err) res.send(err)
        else {
            console.log(data1[0].team_admin_id)
            console.log(req.body.team_id)
            if (data1[0].team_admin_id == req.body.user_id) {
                db.query(`UPDATE user SET user_team_id=? WHERE user_id=?;`, [req.body.team_id, req.body.add_user_id], (err, data2) => {
                    if (err) res.send(err)
                    else {
                        db.query(`SELECT * FROM user WHERE user_id=?;`, [req.body.add_user_id], (err, data3) => {
                            if (!err) res.send(data3)
                            else res.send(err)
                        })
                    }
                })
            } else {
                res.send({error: "User is NOT Admin of the TEAM"})
            }
        }
    })
})

app.post(`/edit/user/sleep`, function (req, res) { // Change user Sleep time
    db.query(`UPDATE user SET user_sleep=? WHERE user_id=?;`, [req.body.user_sleep, req.body.user_id], (err, data) => {
        if (!err) res.send({ message: "success"})
        else res.send(err)
    })
})

app.post(`edit/user/avatar`, function (req, res) { // Change user Avatar
    db.query(`UPDATE user SET user_avatar=? WHERE user_id=?;`, [req.body.user_avatar, req.body.user_id], (err, data) => {
        if (!err) res.send({ message: "success"})
        else res.send(err)
    })
})

// app.post(`edit/user/avatar`, function (req, res) { // Change user 
//     db.query(`UPDATE user SET user_avatar=? WHERE user_id=?;`, [req.body.user_avatar, req.body.user_id], (err, data) => {
//         if (!err) res.send({ message: "success"})
//         else res.send(err)
//     })
// })

app.post(`edit/user/all`, function (req, res) {
    db.query(`UPDATE user SET user_avatar=?, user_name=?, user_wake_up=? WHERE user_id=?`, [req.body.user_avatar, req.body.user_name, req.body.user_wake_up, req.body.user_id], (err, data) => {
        if (!err) res.send({ message: "success"})
        else res.send(err)
    })
})


app.post(`edit/team`, function (req, res) { // Edit Team Information
    db.query(`UPDATE team SET team_name=?, team_logo=?, team_message=?, team_wake_up=? WHERE team_id=?`, [req.body.team_name, req.body.team_logo, req.body.team_message, req.body.team_wake_up, req.body.team_id], (err, data) => {
        if (err) res.send(err)
        else {
            db.query(`SELECT * FROM team WHERE team_id=?`, [req.body.team_id], (err, data) => {
                if (!err) res.send(data)
                else res.send(err)
            })
        }
    })
})


app.listen(3000, function () {
    console.log('server listening on port 3000');
});
