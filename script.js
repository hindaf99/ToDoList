document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("add-task-form");
  const taskInput = document.getElementById("task-input");
  const notesInput = document.getElementById("notes-input");
  const priorityInput = document.getElementById("priority-input");
  const deadlineInput = document.getElementById("deadline-input");
  const taskList = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const emptyMessage = document.getElementById("empty-message");
  const taskCount = document.getElementById("task-count");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentLang = "fr";
  let currentFilter = "all";

  const translations = {
    fr: { title: "Mes tâches", add: "Ajouter une tâche", placeholder: "Que dois-je faire ?", notes: "Ajouter une note", empty: "Aucune tâche. Ajoutez-en une !", tasks: "tâches", all: "Toutes", active: "En cours", completed: "Complétées", complete: "Compléter", deadline: "Échéance", priority: "Priorité", Low: "Faible", Medium: "Moyenne", High: "Haute", delete: "Supprimer la tâche", edit: "Modifier la tâche", addPriority: "Ajouter la priorité" },
    en: { title: "My Tasks", add: "Add Task", placeholder: "What needs to be done?", notes: "Add notes", empty: "No tasks yet", tasks: "tasks", all: "All", active: "Active", completed: "Completed", complete: "Complete", deadline: "Deadline", priority: "Priority", Low: "Low", Medium: "Medium", High: "High", delete: "Delete Task", edit: "Edit Task", addPriority: "Add priority" },
    ar: { title: "مهامي", add: "إضافة مهمة", placeholder: "ماذا يجب أن أفعل؟", notes: "إضافة ملاحظة", empty: "لا توجد مهام بعد", tasks: "مهام", all: "الكل", active: "قيد التنفيذ", completed: "مكتملة", complete: "إكمال", deadline: "الموعد النهائي", priority: "الأولوية", Low: "منخفضة", Medium: "متوسطة", High: "عالية", delete: "حذف المهمة", edit: "تعديل المهمة", addPriority: "إضافة الأولوية" }
  };

  /* ---------------- LANGUAGE SWITCHER ---------------- */
  const langContainer = document.createElement("div");
  langContainer.className = "fixed top-4 right-6 flex gap-2 text-xs z-50";
  ["fr","en","ar"].forEach(lang=>{
    const btn = document.createElement("button");
    btn.textContent = lang.toUpperCase();
    btn.className = "px-2 py-1 bg-gray-200 rounded hover:bg-indigo-600 hover:text-white transition";
    btn.onclick = ()=> changeLanguage(lang);
    langContainer.appendChild(btn);
  });
  document.body.appendChild(langContainer);

  function changeLanguage(lang){
    currentLang = lang;
    document.documentElement.lang = lang;
    document.getElementById("app-title").textContent = translations[lang].title;
    document.getElementById("add-button").textContent = translations[lang].add;
    taskInput.placeholder = translations[lang].placeholder;
    notesInput.placeholder = translations[lang].notes;
    emptyMessage.textContent = translations[lang].empty;

    Array.from(priorityInput.options).forEach(opt=>{
      if(opt.value) opt.textContent = translations[lang][opt.value];
      else opt.textContent = translations[lang].addPriority; // traduction appliquée ici
    });

    renderFilters();
    renderTasks();
  }

  /* ---------------- FILTRES ---------------- */
  const filterContainer = document.createElement("div");
  filterContainer.className = "flex justify-center gap-3 mb-4";
  document.querySelector(".max-w-2xl").insertBefore(filterContainer, taskList);
  function renderFilters(){
    filterContainer.innerHTML = "";
    ["all","active","completed"].forEach(type=>{
      const btn = document.createElement("button");
      btn.textContent = translations[currentLang][type];
      btn.className = "px-3 py-1 rounded-full text-sm transition " + (currentFilter===type ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-indigo-100");
      btn.onclick = ()=>{ currentFilter=type; renderFilters(); renderTasks(); };
      filterContainer.appendChild(btn);
    });
  }

  /* ---------------- AJOUT TÂCHE ---------------- */
  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    const title = taskInput.value.trim();
    if(!title) return;
    const task = { id: Date.now(), title, notes: notesInput.value, priority: priorityInput.value, deadline: deadlineInput.value, completed:false };
    tasks.push(task);
    saveTasks();
    renderTasks();
    form.reset();
  });

  /* ---------------- RENDER ---------------- */
  function renderTasks(){
    taskList.innerHTML = "";
    let filtered = tasks;
    if(currentFilter==="active") filtered = tasks.filter(t=>!t.completed);
    if(currentFilter==="completed") filtered = tasks.filter(t=>t.completed);
    emptyState.classList.toggle("hidden", filtered.length>0);

    filtered.forEach(task=>{
      const li = document.createElement("li");
      li.className = "bg-white p-4 rounded-xl shadow flex justify-between";

      const leftSide = document.createElement("div");
      leftSide.className = "flex flex-col gap-1 flex-1";

      // Ligne 1 : bouton compléter + priorité
      const line1 = document.createElement("div");
      line1.className = "flex items-center gap-2";

      const completeBtn = document.createElement("button");
      completeBtn.className = "w-5 h-5 rounded-full border-2 flex items-center justify-center " + (task.completed?"bg-indigo-600 border-indigo-600":"border-gray-400 hover:border-indigo-600");
      completeBtn.onclick = ()=> toggleComplete(task.id);
      if(task.completed){
        const dot = document.createElement("div");
        dot.className = "w-2.5 h-2.5 bg-white rounded-full";
        completeBtn.appendChild(dot);
      }
      line1.appendChild(completeBtn);

      if(task.priority){
        const priorityEl = document.createElement("span");
        priorityEl.className = "text-xs font-semibold rounded px-2 py-0.5";
        priorityEl.style.backgroundColor = task.priority==="Low"?"#d1fae5":task.priority==="Medium"?"#fef3c7":"#fee2e2";
        priorityEl.style.color = "black";
        priorityEl.textContent = translations[currentLang].priority + " : " + translations[currentLang][task.priority];
        line1.appendChild(priorityEl);
      }
      leftSide.appendChild(line1);

      // Ligne 2 : Titre
      const line2 = document.createElement("div");
      line2.className = "flex items-center gap-3 mt-1";
      const titleEl = document.createElement("h3");
      titleEl.className = "font-semibold " + (task.completed?"line-through text-gray-400":"text-gray-800");
      titleEl.textContent = task.title;
      line2.appendChild(titleEl);
      leftSide.appendChild(line2);

      // Ligne 3 : Notes
      if(task.notes){
        const notesEl = document.createElement("p");
        notesEl.className = "text-sm whitespace-pre-wrap " + (task.completed?"line-through text-gray-400":"text-gray-600");
        notesEl.textContent = task.notes;
        leftSide.appendChild(notesEl);
      }

      // Actions droite + Échéance
      const rightSide = document.createElement("div");
      rightSide.className = "flex flex-col items-end gap-1";

      const actions = document.createElement("div");
      actions.className = "flex gap-2 text-gray-600 text-sm";
      const edit = document.createElement("span");
      edit.className = "cursor-pointer hover:text-indigo-600";
      edit.innerHTML = "✏️"; // icône modifier
      edit.title = translations[currentLang].edit;
      edit.onclick = ()=> editTask(task.id);
      const del = document.createElement("span");
      del.className = "cursor-pointer hover:text-red-500";
      del.innerHTML = "❌"; // icône supprimer
      del.title = translations[currentLang].delete;
      del.onclick = ()=> deleteTask(task.id);
      actions.appendChild(edit);
      actions.appendChild(del);
      rightSide.appendChild(actions);

      if(task.deadline){
        const end = new Date(task.deadline);
        const now = new Date();
        let bgColor = "";
        const diffDays = (end-now)/(1000*60*60*24);
        if(diffDays<0) bgColor="#f87171";
        else if(diffDays<=3) bgColor="#fbbf24";

        const dateEl = document.createElement("span");
        dateEl.className = "text-[12px] font-semibold px-1 py-0.5 rounded";
        dateEl.style.backgroundColor = bgColor;
        dateEl.style.color = "black";
        dateEl.textContent = translations[currentLang].deadline + ": " + end.toLocaleDateString();
        rightSide.appendChild(dateEl);
      }

      li.appendChild(leftSide);
      li.appendChild(rightSide);
      taskList.appendChild(li);
    });

    updateTaskCount();
  }

  function toggleComplete(id){ tasks = tasks.map(t=>t.id===id?{...t,completed:!t.completed}:t); saveTasks(); renderTasks(); }
  function editTask(id){ const task = tasks.find(t=>t.id===id); if(!task) return; taskInput.value=task.title; notesInput.value=task.notes; priorityInput.value=task.priority; deadlineInput.value=task.deadline; tasks = tasks.filter(t=>t.id!==id); saveTasks(); renderTasks(); }
  function deleteTask(id){ tasks = tasks.filter(t=>t.id!==id); saveTasks(); renderTasks(); }
  function saveTasks(){ localStorage.setItem("tasks",JSON.stringify(tasks)); }
  function updateTaskCount(){ taskCount.textContent = tasks.length + " " + translations[currentLang].tasks; }

  renderFilters();
  renderTasks();
  changeLanguage("fr");
});