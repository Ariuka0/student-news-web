const DEMO_POSTS = [
  {
    id: "demo-1",
    title: "Роботын баг бүсийн аваргын цом хүртлээ",
    category: "Клуб",
    content:
      "Хоёр долоо хоногийн турш бүтээж, туршсан аврах робот нь амжилттай оролцож, роботын баг тэргүүн байр эзэллээ. Тэд ирэх сард улсын шатанд сургуулиа төлөөлөн оролцоно.",
    userId: "demo-user-1",
    authorName: "Амина",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    likesCount: 18,
    likedByMe: false,
    isOwner: false,
    comments: [
      {
        id: "demo-comment-1",
        authorName: "Тэмүүлэн",
        commentText: "Үүнийг сургуулиараа тэмдэглэх хэрэгтэй шүү.",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ]
  },
  {
    id: "demo-2",
    title: "Шалгалтын долоо хоногт номын сан орой хүртэл ажиллана",
    category: "Хичээл",
    content:
      "Шалгалтын үеэр номын сан 20:00 цаг хүртэл ажиллах тул оюутнууд илүү тайван орчинд давтлага хийх, багаар ажиллах, төслөө бэлдэх боломжтой боллоо.",
    userId: "demo-user-2",
    authorName: "Нараа",
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    likesCount: 11,
    likedByMe: false,
    isOwner: false,
    comments: []
  },
  {
    id: "demo-3",
    title: "Баасан гарагт спортын багуудаа дэмжих өдөрлөг болно",
    category: "Спорт",
    content:
      "Баасан гарагт сургуулийн өнгийн хувцастай ирж, тоглолтын өмнөх дэмжлэгийн өдөрлөгт оролцох боломжтой. Клубууд мөн талбайн эргэн тойронд танилцуулгын булан гаргана.",
    userId: "demo-user-3",
    authorName: "Жавхаа",
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    likesCount: 9,
    likedByMe: false,
    isOwner: false,
    comments: [
      {
        id: "demo-comment-2",
        authorName: "Билгүүн",
        commentText: "Тоглолтын яг цагийг бас нэмчихвэл гоё байна.",
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
      }
    ]
  }
];

const state = {
  supabase: null,
  isConfigured: false,
  demoMode: true,
  session: null,
  profile: null,
  posts: [],
  category: "Бүгд",
  sortBy: "latest",
  authMode: "login",
  editingPostId: null,
  loading: false
};

const elements = {
  setupCard: document.querySelector("#setupCard"),
  authCard: document.querySelector("#authCard"),
  userCard: document.querySelector("#userCard"),
  authTitle: document.querySelector("#authTitle"),
  authForm: document.querySelector("#authForm"),
  authTabs: Array.from(document.querySelectorAll(".auth-tab")),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  authHelpText: document.querySelector("#authHelpText"),
  displayNameField: document.querySelector("#displayNameField"),
  displayNameInput: document.querySelector("#displayNameInput"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  logoutButton: document.querySelector("#logoutButton"),
  jumpComposerButton: document.querySelector("#jumpComposerButton"),
  composer: document.querySelector("#composer"),
  composerEyebrow: document.querySelector("#composerEyebrow"),
  composerTitle: document.querySelector("#composerTitle"),
  composerHint: document.querySelector("#composerHint"),
  postForm: document.querySelector("#postForm"),
  titleInput: document.querySelector("#titleInput"),
  categoryInput: document.querySelector("#categoryInput"),
  contentInput: document.querySelector("#contentInput"),
  postSubmitButton: document.querySelector("#postSubmitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  userGreeting: document.querySelector("#userGreeting"),
  userEmail: document.querySelector("#userEmail"),
  feed: document.querySelector("#feed"),
  filterBar: document.querySelector("#filterBar"),
  statusMessage: document.querySelector("#statusMessage"),
  sortSelect: document.querySelector("#sortSelect"),
  postCount: document.querySelector("#postCount"),
  likeCount: document.querySelector("#likeCount"),
  commentCount: document.querySelector("#commentCount"),
  featuredStory: document.querySelector("#featuredStory"),
  connectionBadge: document.querySelector("#connectionBadge"),
  refreshButton: document.querySelector("#refreshButton"),
  postTemplate: document.querySelector("#postTemplate")
};

let messageTimeoutId = 0;

init();

async function init() {
  bindEvents();
  setAuthMode("login");
  configureSupabase();
  render();
  await bootstrap();
}

function bindEvents() {
  elements.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.mode));
  });

  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.jumpComposerButton.addEventListener("click", () => {
    elements.composer.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.refreshButton.addEventListener("click", () => void refreshFeed());
  elements.postForm.addEventListener("submit", handlePostSubmit);
  elements.cancelEditButton.addEventListener("click", clearEditState);
  elements.sortSelect.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    renderFeed();
  });
  elements.filterBar.addEventListener("click", handleFilterClick);
  elements.feed.addEventListener("click", (event) => void handleFeedClick(event));
  elements.feed.addEventListener("submit", (event) => void handleFeedSubmit(event));
}

function configureSupabase() {
  const config = window.APP_CONFIG ?? {};
  const hasClient = Boolean(window.supabase?.createClient);
  const hasKeys = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);

  state.isConfigured = hasClient && hasKeys;
  state.demoMode = !state.isConfigured;

  if (state.isConfigured) {
    state.supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }
}

async function bootstrap() {
  if (!state.isConfigured) {
    state.posts = cloneData(DEMO_POSTS);
    render();
    showMessage(
      "Supabase тохиргоо хийгдээгүй тул demo preview ажиллаж байна. `config.js` болон `supabase-setup.sql`-ийг 1-ээс нь хийгээд холбоно.",
      "info",
      true
    );
    return;
  }

  try {
    const {
      data: { session }
    } = await state.supabase.auth.getSession();

    state.session = session;

    if (session) {
      await ensureOwnProfile();
    }

    state.supabase.auth.onAuthStateChange(async (_event, sessionData) => {
      state.session = sessionData;
      state.profile = null;

      if (sessionData) {
        await ensureOwnProfile();
      } else {
        clearEditState();
      }

      await loadPosts();
      render();
    });

    await loadPosts();
    render();
  } catch (error) {
    console.error(error);
    state.demoMode = true;
    state.posts = cloneData(DEMO_POSTS);
    render();
    showMessage(
      "Supabase руу холбогдох үед алдаа гарлаа. Түр demo preview горим руу шилжлээ.",
      "error",
      true
    );
  }
}

async function refreshFeed() {
  if (state.demoMode) {
    state.posts = cloneData(DEMO_POSTS);
    render();
    showMessage("Demo preview шинэчлэгдлээ.", "info");
    return;
  }

  const loaded = await loadPosts();
  render();

  if (loaded) {
    showMessage("Мэдээний жагсаалт шинэчлэгдлээ.", "success");
  }
}

async function ensureOwnProfile() {
  if (!state.session) {
    state.profile = null;
    return;
  }

  const fallbackName = getNameFromEmail(state.session.user.email);
  const displayName = (
    state.session.user.user_metadata?.display_name ||
    state.profile?.display_name ||
    fallbackName
  ).trim();

  const payload = {
    id: state.session.user.id,
    display_name: displayName
  };

  const { error } = await state.supabase.from("profiles").upsert(payload);

  if (error) {
    throw error;
  }

  state.profile = payload;
}

async function loadPosts() {
  if (state.demoMode) {
    state.posts = cloneData(DEMO_POSTS);
    return true;
  }

  state.loading = true;
  renderFeed();

  try {
    const [postsResponse, commentsResponse, likesResponse] = await Promise.all([
      state.supabase
        .from("news_posts")
        .select(
          "id, title, category, content, user_id, created_at, updated_at, profiles!news_posts_user_id_fkey(display_name)"
        )
        .order("created_at", { ascending: false }),
      state.supabase
        .from("comments")
        .select(
          "id, post_id, user_id, comment_text, created_at, profiles!comments_user_id_fkey(display_name)"
        )
        .order("created_at", { ascending: true }),
      state.supabase.from("post_likes").select("post_id, user_id")
    ]);

    if (postsResponse.error) {
      throw postsResponse.error;
    }

    if (commentsResponse.error) {
      throw commentsResponse.error;
    }

    if (likesResponse.error) {
      throw likesResponse.error;
    }

    state.posts = normalizeRemotePosts(
      postsResponse.data ?? [],
      commentsResponse.data ?? [],
      likesResponse.data ?? []
    );
    return true;
  } catch (error) {
    console.error(error);
    showMessage(
      "Өгөгдөл ачаалах үед алдаа гарлаа. SQL policy эсвэл config-аа шалгана уу.",
      "error",
      true
    );
    return false;
  } finally {
    state.loading = false;
  }
}

function normalizeRemotePosts(posts, comments, likes) {
  return posts.map((post) => {
    const postComments = comments
      .filter((comment) => comment.post_id === post.id)
      .map((comment) => ({
        id: comment.id,
        authorName: getRelatedDisplayName(comment.profiles),
        commentText: comment.comment_text,
        createdAt: comment.created_at
      }));

    const postLikes = likes.filter((like) => like.post_id === post.id);

    return {
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content,
      userId: post.user_id,
      authorName: getRelatedDisplayName(post.profiles),
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      likesCount: postLikes.length,
      likedByMe: Boolean(state.session && postLikes.some((like) => like.user_id === state.session.user.id)),
      isOwner: Boolean(state.session && post.user_id === state.session.user.id),
      comments: postComments
    };
  });
}

function render() {
  renderConnectionState();
  renderAuthPanels();
  renderStats();
  renderFeaturedStory();
  renderFilterBar();
  renderFeed();
  renderComposerState();
}

function renderConnectionState() {
  if (!state.isConfigured || state.demoMode) {
    elements.connectionBadge.dataset.state = "setup";
    elements.connectionBadge.textContent = "Тохиргоо хүлээгдэж байна";
    return;
  }

  if (state.session) {
    elements.connectionBadge.dataset.state = "authed";
    elements.connectionBadge.textContent = "Нэвтэрсэн";
    return;
  }

  elements.connectionBadge.dataset.state = "connected";
  elements.connectionBadge.textContent = "Supabase холбогдсон";
}

function renderAuthPanels() {
  elements.setupCard.hidden = state.isConfigured;
  elements.authCard.hidden = !state.isConfigured || Boolean(state.session);
  elements.userCard.hidden = !state.session;

  if (state.session) {
    const name = state.profile?.display_name || getNameFromEmail(state.session.user.email);
    elements.userGreeting.textContent = `${name} та нэвтэрсэн байна`;
    elements.userEmail.textContent = state.session.user.email ?? "";
  }
}

function renderComposerState() {
  const locked = state.demoMode || !state.session;
  const isEditing = Boolean(state.editingPostId);

  elements.composerEyebrow.textContent = isEditing ? "Пост Засварлах" : "Алхам 3";
  elements.composerTitle.textContent = isEditing ? "Өөрийн мэдээг засварлаж байна" : "Шинэ мэдээ нийтлэх";
  elements.postSubmitButton.textContent = isEditing ? "Засварыг Хадгалах" : "Мэдээ Нийтлэх";
  elements.cancelEditButton.hidden = !isEditing;

  if (state.demoMode) {
    elements.composerHint.textContent =
      "Demo preview горимд байна. `config.js` болон SQL setup-аа хийсний дараа энэ form database дээр ажиллана.";
  } else if (!state.session) {
    elements.composerHint.textContent =
      "Нэвтэрсний дараа мэдээ нийтлэх, өөрийн постоо засах, устгах боломжтой болно.";
  } else {
    const name = state.profile?.display_name || getNameFromEmail(state.session.user.email);
    elements.composerHint.textContent = `${name} нэрээр нийтлэгдэнэ. Таны постыг зөвхөн та өөрөө засаж, устгана.`;
  }

  Array.from(elements.postForm.elements).forEach((field) => {
    if (!(field instanceof HTMLElement)) {
      return;
    }

    field.toggleAttribute("disabled", locked);
  });
}

function renderStats() {
  const likeTotal = state.posts.reduce((sum, post) => sum + post.likesCount, 0);
  const commentTotal = state.posts.reduce((sum, post) => sum + post.comments.length, 0);

  elements.postCount.textContent = String(state.posts.length);
  elements.likeCount.textContent = String(likeTotal);
  elements.commentCount.textContent = String(commentTotal);
}

function renderFeaturedStory() {
  if (!state.posts.length) {
    elements.featuredStory.innerHTML = `
      <h2>Одоогоор мэдээ алга</h2>
      <p>Нэвтрээд эхний мэдээгээ нийтлээрэй. Хамгийн их лайктай эсвэл хамгийн шинэхэн мэдээ энд онцлогдоно.</p>
    `;
    return;
  }

  const topStory = [...state.posts].sort((left, right) => {
    if (right.likesCount !== left.likesCount) {
      return right.likesCount - left.likesCount;
    }

    return new Date(right.createdAt) - new Date(left.createdAt);
  })[0];

  elements.featuredStory.innerHTML = `
    <h2>${escapeHtml(topStory.title)}</h2>
    <p>${escapeHtml(topStory.content)}</p>
    <div class="featured-meta">
      <span>${escapeHtml(topStory.category)}</span>
      <span>${topStory.likesCount} лайк</span>
      <span>Нийтэлсэн: ${escapeHtml(topStory.authorName)}</span>
    </div>
  `;
}

function renderFilterBar() {
  const categories = ["Бүгд", ...new Set(state.posts.map((post) => post.category))];
  elements.filterBar.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-chip ${state.category === category ? "active" : ""}`;
    button.dataset.category = category;
    button.textContent = category;
    elements.filterBar.appendChild(button);
  });
}

function renderFeed() {
  if (state.loading) {
    elements.feed.innerHTML = `<div class="loading-feed">Мэдээ ачаалж байна...</div>`;
    return;
  }

  const visiblePosts = getVisiblePosts();
  elements.feed.innerHTML = "";

  if (!visiblePosts.length) {
    elements.feed.innerHTML = `<div class="empty-feed">Энэ ангилалд одоохондоо мэдээ алга.</div>`;
    return;
  }

  visiblePosts.forEach((post) => {
    const fragment = elements.postTemplate.content.cloneNode(true);

    fragment.querySelector(".post-category").textContent = post.category;
    fragment.querySelector(".post-date").textContent = formatDate(post.createdAt);
    fragment.querySelector(".post-title").textContent = post.title;
    fragment.querySelector(".post-content").textContent = post.content;
    fragment.querySelector(".author-badge").textContent = post.authorName;

    const likeButton = fragment.querySelector(".like-btn");
    likeButton.dataset.postId = post.id;
    likeButton.textContent = post.likedByMe ? `Лайкдчихсан (${post.likesCount})` : `Лайк (${post.likesCount})`;
    likeButton.classList.toggle("is-liked", post.likedByMe);
    likeButton.disabled = state.demoMode || !state.session;

    fragment.querySelector(".comment-total").textContent = `${post.comments.length} сэтгэгдэл`;

    const ownerActions = fragment.querySelector(".owner-actions");
    ownerActions.hidden = !post.isOwner;

    const editButton = fragment.querySelector(".edit-btn");
    editButton.dataset.postId = post.id;

    const deleteButton = fragment.querySelector(".delete-btn");
    deleteButton.dataset.postId = post.id;

    const commentsList = fragment.querySelector(".comments-list");

    if (!post.comments.length) {
      commentsList.innerHTML = `<div class="empty-comments">Энэ мэдээнд анхны сэтгэгдлийг үлдээгээрэй.</div>`;
    } else {
      post.comments.forEach((comment) => {
        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `
          <p>${escapeHtml(comment.commentText)}</p>
          <div class="comment-meta">${escapeHtml(comment.authorName)} | ${formatDate(comment.createdAt)}</div>
        `;
        commentsList.appendChild(item);
      });
    }

    const commentForm = fragment.querySelector(".comment-form");
    const commentInput = fragment.querySelector(".comment-input");
    const commentNote = fragment.querySelector(".comment-note");

    commentForm.dataset.postId = post.id;
    commentInput.placeholder = state.session
      ? "Сэтгэгдлээ энд бичнэ үү"
      : "Сэтгэгдэл үлдээхийн тулд нэвтэрнэ үү";
    commentInput.disabled = state.demoMode || !state.session;
    commentForm.querySelector(".comment-btn").disabled = state.demoMode || !state.session;
    commentNote.textContent = state.demoMode
      ? "Supabase тохиргоо хийсний дараа comment database дээр хадгалагдана."
      : state.session
        ? "Сэтгэгдэл нь таны профайл нэрээр хадгалагдана."
        : "Comment үлдээхийн тулд эхлээд нэвтэрнэ үү.";

    elements.feed.appendChild(fragment);
  });
}

function getVisiblePosts() {
  const filteredPosts =
    state.category === "Бүгд"
      ? [...state.posts]
      : state.posts.filter((post) => post.category === state.category);

  return filteredPosts.sort((left, right) => {
    if (state.sortBy === "liked" && right.likesCount !== left.likesCount) {
      return right.likesCount - left.likesCount;
    }

    return new Date(right.createdAt) - new Date(left.createdAt);
  });
}

function handleFilterClick(event) {
  const button = event.target.closest(".filter-chip");

  if (!button) {
    return;
  }

  state.category = button.dataset.category;
  renderFilterBar();
  renderFeed();
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!state.isConfigured || !state.supabase) {
    showMessage("Эхлээд `config.js` болон SQL setup-аа хийгээрэй.", "info");
    return;
  }

  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value.trim();
  const displayName = elements.displayNameInput.value.trim();

  if (!email || !password) {
    showMessage("Имэйл болон нууц үгээ оруулна уу.", "error");
    return;
  }

  try {
    if (state.authMode === "signup") {
      if (!displayName) {
        showMessage("Бүртгүүлэхдээ нэрээ заавал оруулна уу.", "error");
        return;
      }

      const { data, error } = await state.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        showMessage("Бүртгэл амжилттай үүслээ. Одоо мэдээ нийтэлж болно.", "success");
      } else {
        showMessage(
          "Бүртгэл үүслээ. Имэйл баталгаажуулалт асаалттай бол имэйлээ шалгаад нэвтэрнэ үү.",
          "info",
          true
        );
      }
    } else {
      const { error } = await state.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      showMessage("Амжилттай нэвтэрлээ.", "success");
    }

    elements.authForm.reset();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Нэвтрэх үед алдаа гарлаа.", "error", true);
  }
}

async function handleLogout() {
  if (!state.supabase) {
    return;
  }

  const { error } = await state.supabase.auth.signOut();

  if (error) {
    showMessage(error.message || "Гарах үед алдаа гарлаа.", "error", true);
    return;
  }

  clearEditState();
  showMessage("Системээс гарлаа.", "info");
}

async function handlePostSubmit(event) {
  event.preventDefault();

  if (state.demoMode) {
    showMessage("Энэ form-ыг ажиллуулахын тулд эхлээд Supabase холболтоо хийгээрэй.", "info", true);
    return;
  }

  if (!state.session) {
    showMessage("Мэдээ нийтлэхийн тулд нэвтрэнэ үү.", "error");
    return;
  }

  const title = elements.titleInput.value.trim();
  const category = elements.categoryInput.value.trim();
  const content = elements.contentInput.value.trim();

  if (!title || !category || !content) {
    showMessage("Гарчиг, ангилал, агуулгаа бүгдийг бөглөнө үү.", "error");
    return;
  }

  const payload = {
    title,
    category,
    content,
    user_id: state.session.user.id
  };

  try {
    if (state.editingPostId) {
      const { error } = await state.supabase
        .from("news_posts")
        .update({
          title: payload.title,
          category: payload.category,
          content: payload.content
        })
        .eq("id", state.editingPostId)
        .eq("user_id", state.session.user.id);

      if (error) {
        throw error;
      }

      showMessage("Пост амжилттай засагдлаа.", "success");
    } else {
      const { error } = await state.supabase.from("news_posts").insert(payload);

      if (error) {
        throw error;
      }

      showMessage("Мэдээ амжилттай нийтлэгдлээ.", "success");
    }

    clearEditState();
    await loadPosts();
    render();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Пост хадгалах үед алдаа гарлаа.", "error", true);
  }
}

async function handleFeedClick(event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.classList.contains("like-btn")) {
    await toggleLike(button.dataset.postId);
    return;
  }

  if (button.classList.contains("edit-btn")) {
    startEdit(button.dataset.postId);
    return;
  }

  if (button.classList.contains("delete-btn")) {
    await deletePost(button.dataset.postId);
  }
}

async function handleFeedSubmit(event) {
  const form = event.target.closest(".comment-form");

  if (!form) {
    return;
  }

  event.preventDefault();

  if (state.demoMode) {
    showMessage("Comment feature-г database дээр ажиллуулахын тулд Supabase холбоно уу.", "info", true);
    return;
  }

  if (!state.session) {
    showMessage("Comment үлдээхийн тулд эхлээд нэвтэрнэ үү.", "error");
    return;
  }

  const postId = form.dataset.postId;
  const input = form.querySelector(".comment-input");
  const commentText = input.value.trim();

  if (!commentText) {
    showMessage("Сэтгэгдлээ хоосон орхиж болохгүй.", "error");
    return;
  }

  try {
    const { error } = await state.supabase.from("comments").insert({
      post_id: postId,
      user_id: state.session.user.id,
      comment_text: commentText
    });

    if (error) {
      throw error;
    }

    input.value = "";
    await loadPosts();
    render();
    showMessage("Сэтгэгдэл амжилттай хадгалагдлаа.", "success");
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Сэтгэгдэл хадгалах үед алдаа гарлаа.", "error", true);
  }
}

async function toggleLike(postId) {
  if (state.demoMode) {
    showMessage("Like feature-г database дээр ажиллуулахын тулд Supabase холбоно уу.", "info", true);
    return;
  }

  if (!state.session) {
    showMessage("Лайк дарахын тулд эхлээд нэвтэрнэ үү.", "error");
    return;
  }

  const targetPost = state.posts.find((post) => post.id === postId);

  if (!targetPost) {
    return;
  }

  try {
    if (targetPost.likedByMe) {
      const { error } = await state.supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.session.user.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await state.supabase.from("post_likes").insert({
        post_id: postId,
        user_id: state.session.user.id
      });

      if (error) {
        throw error;
      }
    }

    await loadPosts();
    render();
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Лайк шинэчлэх үед алдаа гарлаа.", "error", true);
  }
}

function startEdit(postId) {
  const targetPost = state.posts.find((post) => post.id === postId && post.isOwner);

  if (!targetPost) {
    showMessage("Зөвхөн өөрийн постыг л засах боломжтой.", "error");
    return;
  }

  state.editingPostId = postId;
  elements.titleInput.value = targetPost.title;
  elements.categoryInput.value = targetPost.category;
  elements.contentInput.value = targetPost.content;
  renderComposerState();
  elements.composer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearEditState() {
  state.editingPostId = null;
  elements.postForm.reset();
  elements.categoryInput.value = "Сургууль";
  renderComposerState();
}

async function deletePost(postId) {
  if (state.demoMode) {
    showMessage("Delete feature-г database дээр ажиллуулахын тулд Supabase холбоно уу.", "info", true);
    return;
  }

  const targetPost = state.posts.find((post) => post.id === postId && post.isOwner);

  if (!targetPost) {
    showMessage("Зөвхөн өөрийн постыг л устгах боломжтой.", "error");
    return;
  }

  const shouldDelete = window.confirm("Энэ мэдээг устгах уу?");

  if (!shouldDelete) {
    return;
  }

  try {
    const { error } = await state.supabase
      .from("news_posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", state.session.user.id);

    if (error) {
      throw error;
    }

    if (state.editingPostId === postId) {
      clearEditState();
    }

    await loadPosts();
    render();
    showMessage("Пост устгагдлаа.", "success");
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Пост устгах үед алдаа гарлаа.", "error", true);
  }
}

function setAuthMode(mode) {
  state.authMode = mode;

  elements.authTabs.forEach((button) => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
    button.setAttribute("tabindex", selected ? "0" : "-1");
  });

  const isSignup = mode === "signup";

  elements.authTitle.textContent = isSignup ? "Бүртгэл Үүсгэх" : "Нэвтрэх";
  elements.displayNameField.hidden = !isSignup;
  elements.displayNameField.classList.toggle("hidden-field", !isSignup);
  elements.authSubmitButton.textContent = isSignup ? "Бүртгүүлэх" : "Нэвтрэх";
  elements.authHelpText.textContent = isSignup
    ? "Бүртгэл үүсгэсний дараа өөрийн постоо засах, устгах боломжтой."
    : "Нэвтэрсний дараа comment, like, post, edit бүгд ажиллана.";
}

function showMessage(message, tone = "info", sticky = false) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.tone = tone;

  window.clearTimeout(messageTimeoutId);

  if (!sticky) {
    messageTimeoutId = window.setTimeout(() => {
      elements.statusMessage.textContent = "";
    }, 3200);
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("mn-MN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getRelatedDisplayName(relatedRecord) {
  if (Array.isArray(relatedRecord) && relatedRecord[0]?.display_name) {
    return relatedRecord[0].display_name;
  }

  if (relatedRecord && typeof relatedRecord === "object" && relatedRecord.display_name) {
    return relatedRecord.display_name;
  }

  return "Нэргүй хэрэглэгч";
}

function getNameFromEmail(email) {
  if (!email) {
    return "Хэрэглэгч";
  }

  const namePart = email.split("@")[0].replace(/[._-]+/g, " ").trim();

  if (!namePart) {
    return "Хэрэглэгч";
  }

  return namePart
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
