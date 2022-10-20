// 宣告變數
const baseURL = "https://lighthouse-user-api.herokuapp.com"
const indexAPI = baseURL + "/api/v1/users"
const poster = document.querySelector(".posterContainer")
const search = document.querySelector("#searchFriend")
const showPagination = 16
const pagination = document.querySelector(".pagination")
// 宣告需要陣列
const friendsInformation = []
let searchFriend = []
const mybro = JSON.parse(localStorage.getItem("favorite"))
// function

// poster
function posterFriends(friend) {
  let baseHtml = ''
  friend.forEach(data => {
    baseHtml += `
  <div class="card m-1 col-sm-2 " style="width: 12rem;">
      <img src="${data.avatar}" class="card-img-top seeMore" data-bs-toggle="modal" data-bs-target="#cardMoreImformation" data-modal-id = "${data.id}" alt="friends-pictire">
      <div class="card-body d-flex flex-column justify-content-between align-items-center text-center">
        <h5 class="card-title mb-0">${data.name} ${data.surname}</h5>
        <a href="#" class="btn btn-danger btn-sm delete" data-favorite-id = "${data.id}">dislike</a>
      </div>
    </div>
  `
  })
  poster.innerHTML = baseHtml
}

// modal
function moreInformation(event) {
  const title = document.querySelector("#friendModalLabel")
  const detail = document.querySelector(".friendinformation")
  const avatar = document.querySelector(".friendAvatar")

  const target = event.target
  const id = target.dataset.modalId

  // 檢查id
  if (!id) {
    console.log("fail")
    return
  }
  // 清空內容
  title.textContent = ""
  detail.textContent = ""
  avatar.src = ""
  // 填上MODAL
  axios
    .get(`${indexAPI}/${id}`)
    .then(response => {
      const item = response.data
      title.textContent = `${item.name} ${item.surname}`
      detail.innerHTML = `
      email: ${item.email}<br>
      gender: ${item.gender}<br>
      age: ${item.age}<br>
      region: ${item.region}<br>
      birthday: ${item.birthday}
      `
      avatar.src = item.avatar
    })
}

// search
function searchFriends() {
  const value = search.children[0].value.toLowerCase()
  // 檢查搜尋欄是否為空白，若為空白則顯示原本頁面
  if (!value.length) {
    posterFriends(mybro)
    return alert("Please enter something.")
  }
  searchFriend = mybro.filter(name => {
    return name.name.toLowerCase().indexOf(value.trim().toLowerCase()) > -1 || name.surname.toLowerCase().indexOf(value.trim().toLowerCase()) > -1
  })
  // 檢查是否有資料吻合的朋友
  if (searchFriend.length === 0) {
    posterFriends(mybro)
    search.children[0].value = ""
    return alert(`Wake up!You don't have this friend`)
  }
  // 執行程式
  return posterFriends(searchFriend)
}

// dislike
function dislikeFriend(event) {
  const dislikeFriendId = event.target.dataset.favoriteId
  // 查看要刪除的人在mybro中的位置
  const index = mybro.findIndex(element => {
    return Number(element.id) == dislikeFriendId
  })
  // 確認有無在陣列中
  if (index === -1) {
    return
  }
  // 在陣列中去除
  mybro.splice(index, 1)
  //並重新儲存 
  localStorage.setItem("favorite", JSON.stringify(mybro))

}

// pagination
function showfriendsPage(page) {
  // 確認起始頁數
  const startPage = (page - 1) * showPagination
  // 從陣列出選擇要顯示的資料數
  const nowPagination = mybro.slice(startPage, startPage + showPagination)
  // 重新渲染在網頁上
  posterFriends(nowPagination)
}

function showHowManyPagination(friends) {
  // 確認需要的分頁數
  const total = Math.ceil(friends.length / showPagination)
  // 渲染網頁
  let showPage = ""
  for (let a = 1; a <= total; a++) {
    showPage += `
    <li class="page-item"><a class="page-link" href="#" data-page="${a}">${a}</a></li>
    `
  }
  pagination.innerHTML = showPage
}


// addEventListener
// moreIformation
poster.addEventListener("click", event => {
  if (event.target.matches('.seeMore')) {
    moreInformation(event)
  } else if (event.target.matches('.delete')) {
    // 停止點擊事件時瀏覽器將頁面上滑至頂部
    event.preventDefault()
    dislikeFriend(event)
    showfriendsPage(1)
    showHowManyPagination(mybro)
  }
})

// search
search.addEventListener("submit", event => {
  event.preventDefault()
  searchFriends()
})

// pagination
pagination.addEventListener("click", event => {
  const target = event.target
  if (target.tagName === "A") {
    const nowPage = Number(target.dataset.page)
    showfriendsPage(nowPage)
  }
})

// favorite friends
showfriendsPage(1)
showHowManyPagination(mybro)
