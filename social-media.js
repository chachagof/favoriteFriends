// 宣告變數
const baseURL = "https://lighthouse-user-api.herokuapp.com"
const indexAPI = baseURL + "/api/v1/users"
const poster = document.querySelector(".posterContainer")
const search = document.querySelector("#searchFriend")
const showPagination = 21
const pagination = document.querySelector(".pagination")
// 宣告需要陣列
const friendsInformation = []
let searchFriend = []
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
        <a href="#" class="btn btn-primary btn-sm addMore" data-favorite-id = "${data.id}">add favorite</a>
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
  // 檢查搜尋欄是否為空白
  if (!value.length) {
    posterFriends(friendsInformation)
    return alert("Please enter something.")
  }
  searchFriend = friendsInformation.filter(user => {
    return user.name.toLowerCase().indexOf(value.trim().toLowerCase()) > -1 || user.surname.toLowerCase().indexOf(value.trim().toLowerCase()) > -1
  })
  // 檢查是否有資料吻合的朋友
  if (searchFriend.length === 0) {
    posterFriends(friendsInformation)
    search.children[0].value = ""
    return alert(`Wake up!You don't have this friend`)
  }
  // 執行程式
  return searchFriend
}

// add favorite
function addFavoriteFriends(event) {
  const mybro = JSON.parse(localStorage.getItem("favorite")) || []
  const cardId = event.target.dataset.favoriteId
  //確認有無重複加入最愛 
  if (mybro.some(item => { return Number(item.id) === Number(cardId) })) {
    alert("yor already add this friend in your favorite")
    return
  }
  // 將找到的資料加入最愛資料夾  
  mybro.push(friendsInformation.find(item => {
    return Number(item.id) === Number(cardId)
  }))
  // 儲存至localStorage  
  localStorage.setItem("favorite", JSON.stringify(mybro))
  console.log(mybro)
}

// pagination
function checkFriendsPagination(page) {
  // 確認起始頁數
  const startPage = (page - 1) * showPagination
  // 從陣列出選擇要顯示的資料數
  const nowPagination = searchFriend.length ? searchFriend.slice(startPage, startPage + showPagination) : friendsInformation.slice(startPage, startPage + showPagination)
  // 重新渲染在網頁上
  return nowPagination
}

function showHowManyPagination(friends) {
  // 確認需要的分頁數
  const total = searchFriend.length ? Math.ceil(searchFriend.length / showPagination) : Math.ceil(friends.length / showPagination)
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
  } else if (event.target.matches('.addMore')) {
    // 停止點擊事件時瀏覽器將頁面上滑至頂部
    event.preventDefault()
    addFavoriteFriends(event)
  }
})

// search
search.addEventListener("submit", event => {
  event.preventDefault()
  searchFriends()
  posterFriends(checkFriendsPagination(1))
  showHowManyPagination(searchFriend.length ? searchFriend : friendsInformation)
})

// pagination
pagination.addEventListener("click", event => {
  const target = event.target
  if (target.tagName === "A") {
    const nowPage = Number(target.dataset.page)
    posterFriends(checkFriendsPagination(nowPage))
  }
})

// axios
axios
  .get(indexAPI)
  .then(response => {
    const friends = response.data.results
    friendsInformation.push(...friends)
    posterFriends(checkFriendsPagination(1))
    showHowManyPagination(friendsInformation)
  })