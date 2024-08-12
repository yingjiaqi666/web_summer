const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const users = [];
let current_user = -1
let author = ''
const cycles = []


// 设置视图引擎为 EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

//测试用-----------
app.get('/users', (req, res) => {
    res.send(users);
})
app.get('/user', (req, res) => {
    res.send(current_user);
})
//测试用-----------
app.get('/browse_blogs', (req, res) => {
    res.render('browse_blogs');
})
app.get('/cycles', (req, res) => {
    res.send(cycles);
})
app.get('/create_comment', (req, res) => {
    res.render('create_comment');
})
app.get('/create_blog', (req, res) => {
    res.render('create_blog');
})
app.get('/create_cycle', (req, res) => {
    res.render('create_cycle');
})
app.get('/', (req, res) => {
    current_user = -1;
    res.render('begin');
})
// 注册页面路由
app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/homepage', (req, res) => {
    res.render('homepage');
})
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/browse_cycles_update', (req, res) => {
    res.json(cycles);
});
// app.get('/browse_blogs_update', (req, res) => {
//     res.json(cycles[current_cycle]);
// })
app.get('/browse_cycles', (req, res) => {
    res.sendFile(path.join(__dirname, 'browse_cycles.html'));
});
app.get('/blog_search', (req, res) => {
    res.render('blog_search');
});
app.get('/user_search', (req, res) => {
    res.render('user_search');
})
// 处理注册表单提交
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    // 检查用户是否已经存在
    if (users.some(user => user.username === username)) {
        res.status(400).send('Username already exists');
    } else {
        const comments = []
        const user = {
            "comments":comments,
            "username": username,
            "password": password,
        }
        users.push(user);
        res.render('login');//跳转到登录界面
    }
});

app.post('/create_cycle', (req, res) => {
    const { cycle_name, picture } = req.body;
    // 检查用户是否已经存在
    if (cycles.some(cycle => cycle.cycle_name === cycle_name)) {
        res.status(401).send('Cycle already exists');
    } else {
        const blogs = []
        const cycle = {
            "cycle_name": cycle_name,
            "picture": picture,
            "blogs":blogs
        }
        cycles.push(cycle);
        res.sendFile(path.join(__dirname, 'browse_cycles.html'));
    }
})

app.post('/create_blog', (req, res) => {
    const { cycle_name,blog_name,content,picture } = req.body;

    // 检查兴趣圈是否已经存在
    for (let i = 0; i < cycles.length; i++) {
        if (cycles[i].cycle_name === cycle_name) {
            for (let j = 0; j < cycles[i].blogs.length; j++) {
                if (cycles[i].blogs[j].blog_name === blog_name) {
                    res.status(410).send('blog already exists');
                }
            }
            const comments = []
            let location = ''
            location = cycle_name + '+' + blog_name
            const comment = {
                "location": location,
                "content": content,
                "picture": picture,
                "author":author
            }
            comments.push({...comment});
            users[current_user].comments.push({...comment});
            const blog = {
                "blog_name": blog_name,
                "comments": comments
            }
            cycles[i].blogs.push(blog);
            res.render('blog_details',{blog:cycles[i].blogs[cycles[i].blogs.length-1]})
        }
    }
    res.status(402).send('No such cycle');

})

app.post('/create_comment', (req, res) => {
    const { cycle_name,blog_name,content,picture } = req.body;
    let judge = 0;
    let location= cycle_name +'+'+ blog_name
    const comment = {
        "location": location,
        "content": content,
        "picture": picture,
        "author":author
    }
    // 检查兴趣圈是否已经存在
    for (let i = 0; i < cycles.length; i++) {
        if (cycles[i].cycle_name === cycle_name) {
            for (let j = 0; j < cycles[i].blogs.length; j++) {
                if (cycles[i].blogs[j].blog_name === blog_name) {
                    judge = 1
                    cycles[i].blogs[j].comments.push({...comment});
                    users[current_user].comments.push({...comment});
                    res.render('blog_details',{blog:cycles[i].blogs[j]})
                    break
                }
            }
            break
        }
    }
    res.status(403).send('No such cycle or blog');
})
// 处理登录表单提交
app.post('/browse_blogs', (req, res) => {
    const {cycle_name} = req.body;
    for (let i = 0; i < cycles.length; i++) {
        if (cycles[i].cycle_name === cycle_name) {
            res.render('cycle_blogs',{cycle:cycles[i]})
        }
    }
})
app.post('/blog_search', (req, res) => {
    const {cycle_name,blog_name} = req.body;
    for (let i = 0; i < cycles.length; i++) {
        if (cycles[i].cycle_name === cycle_name) {
            for (let j = 0; j < cycles[i].blogs.length; j++) {
                if (cycles[i].blogs[j].blog_name === blog_name) {
                    res.render('blog_details',{blog:cycles[i].blogs[j]})
                }
            }
            break
        }
    }
    res.status(405).send('cycle_name or blog_name is incorrect');
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username && users[i].password === password) {
            current_user = i;
            author = users[current_user].username;
            res.render('homepage');
        }
    }
    res.status(401).send('Username or password is incorrect');
});
app.post('/user_search', (req, res) => {
    const { username } = req.body;
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            res.render('user_activity',{user:users[i]});
        }
    }
    res.status(409).send('Username is incorrect');
});
// 启动服务器
// 启动服务器
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});