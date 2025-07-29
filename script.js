class TaskManager {
    constructor() {
        this.tasks = [];
        this.teamTasks = [];
        this.projects = [];
        this.currentView = 'board';
        this.currentBoard = 'personal'; // 'personal' or 'team'
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.setupInitialView();
        console.log('TaskManager initialized');
    }

    // Event Binding
    bindEvents() {
        // Sidebar navigation
        const leftSidebar = document.getElementById('leftSidebar');
        const overlay = document.getElementById('overlay');
        
        // Sidebar item clicks
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleSidebarNavigation(e.currentTarget);
            });
        });

        // Content tab navigation
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchContentView(e.target.dataset.view || e.target.closest('.content-tab').dataset.view);
            });
        });

        // Mobile sidebar overlay
        overlay.addEventListener('click', () => {
            leftSidebar.classList.remove('open');
            overlay.classList.remove('open');
        });

        // Task creation modal
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskModal = document.getElementById('taskModal');
        const closeModal = document.querySelector('.close-modal');
        const cancelTask = document.getElementById('cancelTask');
        const createTask = document.getElementById('createTask');

        addTaskBtn.addEventListener('click', () => {
            this.openTaskModal();
        });

        closeModal.addEventListener('click', () => {
            this.closeTaskModal();
        });

        cancelTask.addEventListener('click', () => {
            this.closeTaskModal();
        });

        createTask.addEventListener('click', () => {
            this.createNewTask();
        });

        // Add task to column buttons - using event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-task-to-column')) {
                const column = e.target.closest('.kanban-column');
                const status = column.dataset.status;
                this.openTaskModal(status);
            }
        });

        // Sidebar sections
        document.querySelectorAll('.sidebar-section').forEach(section => {
            section.addEventListener('click', (e) => {
                this.handleSidebarClick(e);
            });
        });

        // Task card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.task-card')) {
                this.handleTaskClick(e.target.closest('.task-card'));
            }
        });

        // Task detail modal events
        const closeTaskDetail = document.getElementById('closeTaskDetail');
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        const dueDateBtn = document.getElementById('dueDateBtn');
        const commentInput = document.getElementById('commentInput');

        closeTaskDetail.addEventListener('click', () => {
            this.closeTaskDetailModal();
        });

        markCompleteBtn.addEventListener('click', () => {
            this.toggleTaskCompletionInModal();
        });

        dueDateBtn.addEventListener('click', () => {
            this.toggleDueDateInput();
        });

        // Auto-save task details on input
        document.getElementById('taskTitleInput').addEventListener('input', (e) => {
            this.updateCurrentTaskField('name', e.target.value);
        });

        document.getElementById('descriptionTextarea').addEventListener('input', (e) => {
            this.updateCurrentTaskField('description', e.target.value);
        });

        document.getElementById('dueDateDetailInput').addEventListener('change', (e) => {
            this.updateCurrentTaskField('dueDate', e.target.value);
            this.updateDueDateDisplay();
        });

        // Comment submission
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.addComment();
            }
        });

        // Column title editing - using event delegation for dynamic content
        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('column-title')) {
                this.saveColumnTitle(e.target);
            }
        }, true);
        
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('column-title') && e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeTaskDetailModal();
                leftSidebar.classList.remove('open');
                overlay.classList.remove('open');
            }
        });
    }

    // Navigation Management
    handleSidebarNavigation(item) {
        const section = item.dataset.section;
        
        // Remove active state from all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(sidebarItem => {
            sidebarItem.classList.remove('active');
        });
        
        // Add active state to clicked item
        item.classList.add('active');
        
        // Handle section-specific logic
        switch (section) {
            case 'my-tasks':
                this.showMyTasksView();
                break;
            case 'capture':
                this.showCaptureView();
                break;
            case 'summaries':
                this.showSummariesView();
                break;
            case 'to-read':
                this.showToReadView();
                break;
            case 'someday-maybe':
                this.showSomedayMaybeView();
                break;
            case 'team':
                this.showTeamView();
                break;
            default:
                console.log(`Navigated to ${section}`);
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            document.getElementById('leftSidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('open');
        }
    }

    switchContentView(viewType) {
        // Since we only have board view now, just ensure it's active
        const boardTab = document.querySelector('[data-view="board"]');
        if (boardTab) {
            boardTab.classList.add('active');
        }
        
        this.currentView = 'board';
        console.log('Board view active');
    }

    showMyTasksView() {
        // Update content header
        const contentTitle = document.querySelector('.content-title');
        if (contentTitle) {
            contentTitle.innerHTML = 'My tasks <span class="dropdown-arrow">⌄</span>';
        }
        
        // Switch to personal board
        this.currentBoard = 'personal';
        this.switchToPersonalBoard();
        
        console.log('Showing My Tasks view');
    }

    showCaptureView() {
        console.log('Showing Capture view - placeholder for future implementation');
        // TODO: Implement capture view
    }

    showSummariesView() {
        console.log('Showing Summaries view - placeholder for future implementation');
        // TODO: Implement summaries view
    }

    showToReadView() {
        console.log('Showing To Read view - placeholder for future implementation');
        // TODO: Implement reading list view
    }

    showSomedayMaybeView() {
        console.log('Showing Someday Maybe view - placeholder for future implementation');
        // TODO: Implement someday maybe view
    }

    showTeamView() {
        // Update content header
        const contentTitle = document.querySelector('.content-title');
        if (contentTitle) {
            contentTitle.innerHTML = 'Team Project Board <span class="dropdown-arrow">⌄</span>';
        }
        
        // Switch to team board
        this.currentBoard = 'team';
        this.switchToTeamBoard();
        
        console.log('Showing Team Project Board');
    }

    switchToPersonalBoard() {
        // Hide team board, show personal board
        document.getElementById('kanbanBoard').style.display = 'flex';
        document.getElementById('teamKanbanBoard').style.display = 'none';
        
        // Re-setup drag and drop for personal board
        this.setupDragAndDrop();
        
        console.log('Switched to personal board');
    }

    switchToTeamBoard() {
        // Hide personal board, show team board
        document.getElementById('kanbanBoard').style.display = 'none';
        document.getElementById('teamKanbanBoard').style.display = 'flex';
        
        // Render existing team tasks
        this.teamTasks.forEach(task => {
            this.renderTeamTask(task);
        });
        
        // Update task counts for team board
        this.updateTeamTaskCounts();
        
        // Setup drag and drop for team board
        this.setupTeamDragAndDrop();
        
        console.log('Switched to team board');
    }

    setupInitialView() {
        // Set up the initial board view
        // Render existing tasks in kanban board
        this.tasks.forEach(task => {
            this.renderTask(task);
        });
        
        this.updateTaskCounts();
        this.loadColumnTitles();
        this.setupDragAndDrop();
    }

    // Task Management
    openTaskModal(defaultStatus = null) {
        const modal = document.getElementById('taskModal');
        const overlay = document.getElementById('overlay');
        
        // Reset form
        document.getElementById('taskNameInput').value = '';
        document.getElementById('taskDescriptionInput').value = '';
        document.getElementById('assigneeSelect').value = '';
        document.getElementById('projectSelect').value = '';
        document.getElementById('dueDateInput').value = '';
        
        modal.classList.add('open', 'fade-in');
        overlay.classList.add('open');
        
        // Focus on task name input
        setTimeout(() => {
            document.getElementById('taskNameInput').focus();
        }, 100);
        
        // Store the default status if provided
        modal.dataset.defaultStatus = defaultStatus || 'untitled';
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.remove('open', 'fade-in');
        overlay.classList.remove('open');
    }

    createNewTask() {
        const taskName = document.getElementById('taskNameInput').value.trim();
        const taskDescription = document.getElementById('taskDescriptionInput').value.trim();
        const assignee = document.getElementById('assigneeSelect').value;
        const project = document.getElementById('projectSelect').value;
        const dueDate = document.getElementById('dueDateInput').value;
        const modal = document.getElementById('taskModal');
        let status = modal.dataset.defaultStatus || 'untitled';

        if (!taskName) {
            alert('Please enter a task name');
            return;
        }

        // Determine which board we're creating the task for
        if (this.currentBoard === 'team') {
            // If no specific status set and we're on team board, use default team status
            if (status === 'untitled') {
                status = 'team-todo';
            }
        }

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            description: taskDescription,
            assignee: assignee,
            project: project,
            dueDate: dueDate,
            status: status,
            createdAt: new Date().toISOString(),
            completed: false
        };

        // Add to appropriate task array
        if (this.currentBoard === 'team') {
            this.teamTasks.push(newTask);
            this.renderTeamTask(newTask);
            this.updateTeamTaskCounts();
        } else {
            this.tasks.push(newTask);
            this.renderTask(newTask);
            this.updateTaskCounts();
        }
        
        this.saveData();
        this.closeTaskModal();
        
        console.log(`Created new ${this.currentBoard} task:`, newTask);
    }


    renderTask(task) {
        // For kanban board view
        const column = document.querySelector(`[data-status="${task.status}"] .column-content`);
        if (!column) return;

        // Use the new renderTaskInColumn method for consistency
        return this.renderTaskInColumn(task, column);
    }

    renderTeamTask(task) {
        // For team kanban board view
        const column = document.querySelector(`#teamKanbanBoard [data-status="${task.status}"] .column-content`);
        if (!column) return;

        // Use the same renderTaskInColumn method for consistency
        return this.renderTaskInColumn(task, column);
    }


    updateTeamTaskCounts() {
        document.querySelectorAll('#teamKanbanBoard .kanban-column').forEach(column => {
            const status = column.dataset.status;
            const taskCount = column.querySelectorAll('.task-card').length;
            const countElement = column.querySelector('.task-count');
            if (countElement) {
                countElement.textContent = taskCount;
            }
        });
    }

    setupTeamDragAndDrop() {
        // Add drop zone listeners to all team columns
        document.querySelectorAll('#teamKanbanBoard .column-content').forEach(column => {
            column.addEventListener('dragover', (e) => {
                this.handleDragOver(e);
            });

            column.addEventListener('drop', (e) => {
                this.handleTeamDrop(e);
            });

            column.addEventListener('dragenter', (e) => {
                this.handleDragEnter(e);
            });

            column.addEventListener('dragleave', (e) => {
                this.handleDragLeave(e);
            });
        });
    }

    handleTeamDrop(e) {
        e.preventDefault();
        
        const taskId = e.dataTransfer.getData('text/plain');
        const columnContent = e.currentTarget;
        const newColumn = columnContent.closest('.kanban-column');
        const newStatus = newColumn.dataset.status;
        
        // Find the task in team tasks and update its status
        const task = this.teamTasks.find(t => t.id === taskId);
        if (!task) return;
        
        const oldStatus = task.status;
        if (oldStatus === newStatus) {
            // Remove drag-over classes even if no change
            columnContent.classList.remove('drag-over');
            newColumn.classList.remove('drag-over');
            return; // No change needed
        }
        
        // Update task status
        task.status = newStatus;
        
        // Find and remove the task card from its current location
        const taskCard = document.querySelector(`#teamKanbanBoard [data-task-id="${taskId}"]`);
        if (taskCard) {
            // Remove from DOM completely
            taskCard.remove();
            
            // Re-render the task in the new column with all properties intact
            this.renderTaskInColumn(task, columnContent);
        }
        
        // Update task counts for team board
        this.updateTeamTaskCounts();
        
        // Save data
        this.saveData();
        
        // Remove drag-over classes
        columnContent.classList.remove('drag-over');
        newColumn.classList.remove('drag-over');
        
        console.log(`Team task ${taskId} moved from ${oldStatus} to ${newStatus}`);
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        this.saveData();
        
        // Update the task card in the board
        this.updateTaskCardInBoard(task);
        
        console.log('Task completion toggled:', task);
    }

    getAssigneeInitials(assignee) {
        const assigneeMap = {
            'greg': 'GH',
            'leo': 'LB',
            'nikah': 'NP'
        };
        return assigneeMap[assignee] || 'UN';
    }

    handleTaskClick(taskCard) {
        const taskId = taskCard.dataset.taskId;
        
        // Check both personal and team tasks
        let task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            task = this.teamTasks.find(t => t.id === taskId);
        }
        
        if (task) {
            console.log('Task clicked:', task);
            this.openTaskDetailModal(task);
        }
    }

    toggleTaskCompletion(task, taskCard) {
        task.completed = !task.completed;
        
        const statusElement = taskCard.querySelector('.task-status');
        if (task.completed) {
            statusElement.classList.add('completed');
            statusElement.style.backgroundColor = 'var(--success-color)';
            statusElement.style.borderColor = 'var(--success-color)';
        } else {
            statusElement.classList.remove('completed');
            statusElement.style.backgroundColor = 'transparent';
            statusElement.style.borderColor = 'var(--text-secondary)';
        }
        
        this.saveData();
        console.log('Task completion toggled:', task);
    }

    updateTaskCounts() {
        document.querySelectorAll('.kanban-column').forEach(column => {
            const status = column.dataset.status;
            const taskCount = column.querySelectorAll('.task-card').length;
            const countElement = column.querySelector('.task-count');
            if (countElement) {
                countElement.textContent = taskCount;
            }
        });
    }


    exportData() {
        const data = {
            tasks: this.tasks,
            projects: this.projects,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `uncommon-command-center-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('Data exported successfully');
    }

    // Data Persistence
    saveData() {
        try {
            const data = {
                tasks: this.tasks,
                teamTasks: this.teamTasks,
                projects: this.projects,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('uncommonCommandCenter', JSON.stringify(data));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('uncommonCommandCenter');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.tasks = data.tasks || [];
                this.teamTasks = data.teamTasks || [];
                this.projects = data.projects || [];
                console.log('Data loaded from localStorage:', data);
                
                // Don't render tasks here - they'll be rendered in setupInitialView
                // to avoid duplication
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.tasks = [];
            this.teamTasks = [];
            this.projects = [];
        }
    }

    // Task Detail Modal Management
    openTaskDetailModal(task) {
        this.currentTask = task;
        const modal = document.getElementById('taskDetailModal');
        const overlay = document.getElementById('overlay');
        
        // Populate modal with task data
        this.populateTaskDetailModal(task);
        
        modal.classList.add('open');
        overlay.classList.add('open');
        
        console.log('Opened task detail modal for:', task);
    }

    closeTaskDetailModal() {
        const modal = document.getElementById('taskDetailModal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.remove('open');
        overlay.classList.remove('open');
        
        this.currentTask = null;
        this.saveData();
    }

    populateTaskDetailModal(task) {
        // Set task title
        document.getElementById('taskTitleInput').value = task.name || '';
        
        // Set description
        document.getElementById('descriptionTextarea').value = task.description || '';
        
        // Set assignee
        this.updateAssigneeDisplay(task.assignee);
        
        // Set due date
        if (task.dueDate) {
            document.getElementById('dueDateDetailInput').value = task.dueDate;
            this.updateDueDateDisplay();
        } else {
            document.querySelector('.due-date-text').textContent = 'No due date';
        }
        
        // Set completion status
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (task.completed) {
            markCompleteBtn.classList.add('completed');
            markCompleteBtn.querySelector('.btn-text').textContent = 'Mark incomplete';
        } else {
            markCompleteBtn.classList.remove('completed');
            markCompleteBtn.querySelector('.btn-text').textContent = 'Mark complete';
        }
        
        // Load comments
        this.loadTaskComments(task);
    }

    updateAssigneeDisplay(assignee) {
        const assigneeSection = document.getElementById('assigneeSection');
        const assigneePill = assigneeSection.querySelector('.assignee-pill');
        
        if (assignee && assignee !== '') {
            const assigneeNames = {
                'greg': 'Greg Van Horn',
                'leo': 'Leo Bergonzi',
                'nikah': 'Nikah Pardinas'
            };
            
            const assigneeInitials = this.getAssigneeInitials(assignee);
            const assigneeName = assigneeNames[assignee] || assignee;
            
            assigneePill.style.display = 'flex';
            assigneePill.querySelector('.assignee-avatar-large').textContent = assigneeInitials;
            assigneePill.querySelector('.assignee-name').textContent = assigneeName;
        } else {
            assigneePill.style.display = 'none';
        }
    }

    toggleTaskCompletionInModal() {
        if (!this.currentTask) return;
        
        this.currentTask.completed = !this.currentTask.completed;
        
        // Update button appearance
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (this.currentTask.completed) {
            markCompleteBtn.classList.add('completed');
            markCompleteBtn.querySelector('.btn-text').textContent = 'Mark incomplete';
        } else {
            markCompleteBtn.classList.remove('completed');
            markCompleteBtn.querySelector('.btn-text').textContent = 'Mark complete';
        }
        
        // Update the task card in the board
        this.updateTaskCardInBoard(this.currentTask);
        this.saveData();
    }

    updateTaskCardInBoard(task) {
        // Search in both personal and team boards
        let taskCard = document.querySelector(`#kanbanBoard [data-task-id="${task.id}"]`);
        if (!taskCard) {
            taskCard = document.querySelector(`#teamKanbanBoard [data-task-id="${task.id}"]`);
        }
        
        if (taskCard) {
            const statusElement = taskCard.querySelector('.task-status');
            if (task.completed) {
                statusElement.style.backgroundColor = 'var(--success-color)';
                statusElement.style.borderColor = 'var(--success-color)';
                statusElement.classList.add('completed');
            } else {
                statusElement.style.backgroundColor = 'transparent';
                statusElement.style.borderColor = 'var(--text-secondary)';
                statusElement.classList.remove('completed');
            }
            
            // Update the task title in case it was changed
            const taskTitle = taskCard.querySelector('h4');
            if (taskTitle) {
                taskTitle.textContent = task.name;
            }
        }
    }

    toggleDueDateInput() {
        const dueDateBtn = document.getElementById('dueDateBtn');
        const dueDateInput = document.getElementById('dueDateDetailInput');
        
        if (dueDateInput.style.display === 'none' || dueDateInput.style.display === '') {
            dueDateBtn.style.display = 'none';
            dueDateInput.style.display = 'block';
            dueDateInput.focus();
            
            // Hide input when clicked outside or on blur
            const hideInput = () => {
                dueDateBtn.style.display = 'flex';
                dueDateInput.style.display = 'none';
                this.updateDueDateDisplay();
            };
            
            dueDateInput.addEventListener('blur', hideInput, { once: true });
        }
    }

    updateDueDateDisplay() {
        const dueDateInput = document.getElementById('dueDateDetailInput');
        const dueDateText = document.querySelector('.due-date-text');
        
        if (dueDateInput.value) {
            const date = new Date(dueDateInput.value);
            dueDateText.textContent = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } else {
            dueDateText.textContent = 'No due date';
        }
    }

    updateCurrentTaskField(field, value) {
        if (!this.currentTask) return;
        
        this.currentTask[field] = value;
        
        // Update the task card in the appropriate board
        this.updateTaskCardInBoard(this.currentTask);
        
        // Auto-save with debounce
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveData();
        }, 500);
    }

    loadTaskComments(task) {
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        
        if (task.comments && task.comments.length > 0) {
            task.comments.forEach(comment => {
                this.renderComment(comment);
            });
        }
    }

    addComment() {
        const commentInput = document.getElementById('commentInput');
        const commentText = commentInput.value.trim();
        
        if (!commentText || !this.currentTask) return;
        
        const comment = {
            id: this.generateId(),
            text: commentText,
            author: 'Greg Van Horn', // This would come from current user
            authorInitials: 'GH',
            timestamp: new Date().toISOString()
        };
        
        if (!this.currentTask.comments) {
            this.currentTask.comments = [];
        }
        
        this.currentTask.comments.push(comment);
        this.renderComment(comment);
        
        commentInput.value = '';
        this.saveData();
    }

    renderComment(comment) {
        const commentsList = document.getElementById('commentsList');
        
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        
        commentElement.innerHTML = `
            <div class="comment-avatar">${comment.authorInitials}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.author} • ${this.formatCommentDate(comment.timestamp)}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
    }

    formatCommentDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    }

    // Utility Methods
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Drag and Drop Setup
    setupDragAndDrop() {
        // Add drop zone listeners to all columns (set up once)
        document.querySelectorAll('.column-content').forEach(column => {
            column.addEventListener('dragover', (e) => {
                this.handleDragOver(e);
            });

            column.addEventListener('drop', (e) => {
                this.handleDrop(e);
            });

            column.addEventListener('dragenter', (e) => {
                this.handleDragEnter(e);
            });

            column.addEventListener('dragleave', (e) => {
                this.handleDragLeave(e);
            });
        });
    }

    addDragListeners(taskCard) {
        taskCard.addEventListener('dragstart', (e) => {
            this.handleDragStart(e);
        });

        taskCard.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });
    }

    handleDragStart(e) {
        const taskCard = e.target;
        taskCard.classList.add('dragging');
        
        // Store the task ID being dragged
        e.dataTransfer.setData('text/plain', taskCard.dataset.taskId);
        e.dataTransfer.effectAllowed = 'move';
        
        console.log('Drag started for task:', taskCard.dataset.taskId);
    }

    handleDragEnd(e) {
        const taskCard = e.target;
        taskCard.classList.remove('dragging');
        
        // Remove drag-over class from all columns
        document.querySelectorAll('.column-content').forEach(column => {
            column.classList.remove('drag-over');
        });
        
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        const columnContent = e.currentTarget;
        const column = columnContent.closest('.kanban-column');
        
        columnContent.classList.add('drag-over');
        column.classList.add('drag-over');
    }

    handleDragLeave(e) {
        // Only remove the class if we're leaving the column content entirely
        const columnContent = e.currentTarget;
        const column = columnContent.closest('.kanban-column');
        
        // Check if the related target is still within this column
        if (!columnContent.contains(e.relatedTarget)) {
            columnContent.classList.remove('drag-over');
            column.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const taskId = e.dataTransfer.getData('text/plain');
        const columnContent = e.currentTarget;
        const newColumn = columnContent.closest('.kanban-column');
        const newStatus = newColumn.dataset.status;
        
        // Find the task and update its status
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const oldStatus = task.status;
        if (oldStatus === newStatus) {
            // Remove drag-over classes even if no change
            columnContent.classList.remove('drag-over');
            newColumn.classList.remove('drag-over');
            return; // No change needed
        }
        
        // Update task status
        task.status = newStatus;
        
        // Find and remove the task card from its current location
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            // Store the parent for proper removal
            const oldParent = taskCard.parentNode;
            
            // Remove from DOM completely
            taskCard.remove();
            
            // Re-render the task in the new column with all properties intact
            this.renderTaskInColumn(task, columnContent);
        }
        
        // Update task counts for both old and new columns
        this.updateTaskCounts();
        
        // Save data
        this.saveData();
        
        // Remove drag-over classes
        columnContent.classList.remove('drag-over');
        newColumn.classList.remove('drag-over');
        
        console.log(`Task ${taskId} moved from ${oldStatus} to ${newStatus}`);
    }

    renderTaskInColumn(task, columnContent) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.dataset.taskId = task.id;
        taskCard.draggable = true;
        
        // Get assignee initials
        const assigneeInitials = this.getAssigneeInitials(task.assignee);
        
        taskCard.innerHTML = `
            <div class="task-header">
                <span class="task-status ${task.completed ? 'completed' : ''}"></span>
                <h4>${task.name}</h4>
            </div>
            <div class="task-assignee">
                <div class="assignee-avatar">${assigneeInitials}</div>
            </div>
        `;

        // Add drag and drop event listeners
        this.addDragListeners(taskCard);
        
        // Add click handler for task detail modal
        taskCard.addEventListener('click', (e) => {
            // Don't open modal if dragging
            if (!taskCard.classList.contains('dragging')) {
                this.handleTaskClick(taskCard);
            }
        });

        // Add to column with animation
        columnContent.appendChild(taskCard);
        taskCard.style.animation = 'fadeIn 0.3s ease';
        
        // Set proper completion status styling
        if (task.completed) {
            const statusElement = taskCard.querySelector('.task-status');
            statusElement.style.backgroundColor = 'var(--success-color)';
            statusElement.style.borderColor = 'var(--success-color)';
        }
        
        return taskCard;
    }

    // Column Title Editing
    saveColumnTitle(titleElement) {
        const newTitle = titleElement.textContent.trim();
        const originalTitle = titleElement.dataset.original;
        
        if (newTitle === '' || newTitle === originalTitle) {
            // Reset to original if empty or unchanged
            titleElement.textContent = originalTitle;
            return;
        }
        
        // Save the new title (you could extend this to save to localStorage or backend)
        titleElement.dataset.original = newTitle;
        
        console.log('Column title updated:', newTitle);
        
        // You could add persistence here
        this.saveColumnTitles();
    }

    saveColumnTitles() {
        const personalColumnTitles = {};
        const teamColumnTitles = {};
        
        // Save personal board column titles
        document.querySelectorAll('#kanbanBoard .column-title').forEach(title => {
            const column = title.closest('.kanban-column');
            const status = column.dataset.status;
            personalColumnTitles[status] = title.textContent.trim();
        });
        
        // Save team board column titles
        document.querySelectorAll('#teamKanbanBoard .column-title').forEach(title => {
            const column = title.closest('.kanban-column');
            const status = column.dataset.status;
            teamColumnTitles[status] = title.textContent.trim();
        });
        
        // Save to localStorage
        localStorage.setItem('personalColumnTitles', JSON.stringify(personalColumnTitles));
        localStorage.setItem('teamColumnTitles', JSON.stringify(teamColumnTitles));
        console.log('Column titles saved - Personal:', personalColumnTitles, 'Team:', teamColumnTitles);
    }

    loadColumnTitles() {
        try {
            // Load personal board column titles
            const personalTitles = localStorage.getItem('personalColumnTitles');
            if (personalTitles) {
                const personalColumnTitles = JSON.parse(personalTitles);
                
                Object.keys(personalColumnTitles).forEach(status => {
                    const titleElement = document.querySelector(`#kanbanBoard [data-status="${status}"] .column-title`);
                    if (titleElement) {
                        titleElement.textContent = personalColumnTitles[status];
                        titleElement.dataset.original = personalColumnTitles[status];
                    }
                });
                
                console.log('Personal column titles loaded:', personalColumnTitles);
            }
            
            // Load team board column titles
            const teamTitles = localStorage.getItem('teamColumnTitles');
            if (teamTitles) {
                const teamColumnTitles = JSON.parse(teamTitles);
                
                Object.keys(teamColumnTitles).forEach(status => {
                    const titleElement = document.querySelector(`#teamKanbanBoard [data-status="${status}"] .column-title`);
                    if (titleElement) {
                        titleElement.textContent = teamColumnTitles[status];
                        titleElement.dataset.original = teamColumnTitles[status];
                    }
                });
                
                console.log('Team column titles loaded:', teamColumnTitles);
            }
            
            
            // Backward compatibility - load old format if it exists
            const oldTitles = localStorage.getItem('kanbanColumnTitles');
            if (oldTitles && !personalTitles) {
                const columnTitles = JSON.parse(oldTitles);
                
                Object.keys(columnTitles).forEach(status => {
                    const titleElement = document.querySelector(`#kanbanBoard [data-status="${status}"] .column-title`);
                    if (titleElement) {
                        titleElement.textContent = columnTitles[status];
                        titleElement.dataset.original = columnTitles[status];
                    }
                });
                
                console.log('Legacy column titles loaded:', columnTitles);
            }
        } catch (error) {
            console.error('Error loading column titles:', error);
        }
    }
}

// Initialize the TaskManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Add some utility functions for drag and drop (to be implemented later)
function enableDragAndDrop() {
    // Drag and drop functionality will be added here
    console.log('Drag and drop functionality to be implemented');
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for quick task creation
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.taskManager) {
            window.taskManager.openTaskModal();
        }
    }
    
    // Ctrl/Cmd + / for help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        console.log('Keyboard shortcuts:', {
            'Ctrl/Cmd + K': 'Create new task',
            'Ctrl/Cmd + /': 'Show help',
            'Escape': 'Close modals/sidebar'
        });
    }
});

// Add window resize handler for responsive behavior
window.addEventListener('resize', () => {
    const leftSidebar = document.getElementById('leftSidebar');
    const overlay = document.getElementById('overlay');
    
    // Close sidebar on desktop screens
    if (window.innerWidth > 1024) {
        leftSidebar.classList.remove('open');
        overlay.classList.remove('open');
    }
});