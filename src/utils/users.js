const users = [];

//adduser,removeUser,getUser,getUsersInRoom

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //check for existing user ,username must be unique in a each room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //stored user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  //-1 for not match
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser=(id)=>{
  return users.find((user)=>{
     return user.id===id
  })
}

const getUsersInRoom=(room)=>{
    room = room.trim().toLowerCase();    
   return users.filter((user)=>{
      return user.room===room
})
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id:22,
//     username:"rounak",
//     room:"cricket"
// })

// addUser({
//     id:32,
//     username:"khushi",
//     room:"hockey"
// })

// addUser({
//     id:42,
//     username:"khushal",
//     room:"cricket"
// })

// const user=getUser(32)
// console.log(user);

// const userList=getUsersInRoom("hockey")
// console.log(userList);


// console.log(users);
// const removed=removeUser(22)
// console.log(removed);
// console.log(users);

// const res=addUser({
//     id:23,
//     username:"",
//     room:""
// })
// console.log(res);

