// 全局变量
let drawnNumbers = [];
let isDrawing = false;
const TOTAL_PARTICIPANTS = 100;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    updateUI();
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !isDrawing) {
            event.preventDefault();
            startLottery();
        } else if (event.code === 'KeyR' && event.ctrlKey) {
            event.preventDefault();
            resetLottery();
        }
    });
});

// 从本地存储加载数据
function loadSavedData() {
    try {
        const saved = localStorage.getItem('lotteryData');
        if (saved) {
            const data = JSON.parse(saved);
            drawnNumbers = data.drawnNumbers || [];
        }
    } catch (error) {
        console.warn('无法加载保存的抽奖数据:', error);
        drawnNumbers = [];
    }
}

// 保存数据到本地存储
function saveData() {
    try {
        const data = {
            drawnNumbers: drawnNumbers,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('lotteryData', JSON.stringify(data));
    } catch (error) {
        console.warn('无法保存抽奖数据:', error);
    }
}

// 开始抽奖
function startLottery() {
    if (isDrawing) return;
    
    // 检查是否所有号码都已抽完
    if (drawnNumbers.length >= TOTAL_PARTICIPANTS) {
        showMessage('所有号码都已抽完！');
        return;
    }
    
    isDrawing = true;
    const startButton = document.getElementById('startLottery');
    const lotteryNumber = document.getElementById('lotteryNumber');
    const lotteryStatus = document.getElementById('lotteryStatus');
    
    // 更新按钮状态
    startButton.disabled = true;
    startButton.textContent = '🎰 抽奖中... 🎰';
    
    // 更新状态
    lotteryStatus.textContent = '🎊 抽奖进行中... 🎊';
    
    // 快速滚动效果
    let scrollCount = 0;
    const maxScrollCount = 30;
    const scrollInterval = setInterval(() => {
        // 随机显示号码
        const randomNumber = Math.floor(Math.random() * TOTAL_PARTICIPANTS) + 1;
        updateNumberDisplay(randomNumber, false);
        
        scrollCount++;
        
        if (scrollCount >= maxScrollCount) {
            clearInterval(scrollInterval);
            
            // 最终抽取一个未抽中的号码
            const finalNumber = getRandomUnusedNumber();
            
            // 延迟显示最终结果，增强悬念感
            setTimeout(() => {
                revealNumber(finalNumber);
                isDrawing = false;
                
                // 恢复按钮状态
                startButton.disabled = false;
                startButton.textContent = '🎊 继续抽奖 🎊';
                
                // 检查是否还有未抽中的号码
                if (drawnNumbers.length >= TOTAL_PARTICIPANTS) {
                    startButton.disabled = true;
                    startButton.textContent = '🎉 抽奖完成 🎉';
                    lotteryStatus.textContent = '🎊 所有号码已抽完！恭喜所有参与者！ 🎊';
                }
            }, 500);
        }
    }, 100);
}

// 获取随机未使用的号码
function getRandomUnusedNumber() {
    const usedNumbers = new Set(drawnNumbers);
    const availableNumbers = [];
    
    for (let i = 1; i <= TOTAL_PARTICIPANTS; i++) {
        if (!usedNumbers.has(i)) {
            availableNumbers.push(i);
        }
    }
    
    if (availableNumbers.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
}

// 揭示中奖号码
function revealNumber(number) {
    if (number === null) return;
    
    // 添加号码到已抽中列表
    drawnNumbers.push(number);
    
    // 保存数据
    saveData();
    
    // 更新UI显示
    updateNumberDisplay(number, true);
    updateUI();
    
    // 触发庆祝动画
    createCelebration();
    
    // 显示中奖消息
    showMessage(`🎉 恭喜第 ${number} 号中奖！ 🎉`);
}

// 更新号码显示
function updateNumberDisplay(number, isFinal = false) {
    const lotteryNumber = document.getElementById('lotteryNumber');
    
    if (isFinal) {
        lotteryNumber.classList.add('drawn');
        lotteryNumber.innerHTML = `<span>${number}</span>`;
        
        // 移除动画类以便下次使用
        setTimeout(() => {
            lotteryNumber.classList.remove('drawn');
        }, 800);
    } else {
        lotteryNumber.innerHTML = `<span>${number}</span>`;
    }
}

// 更新UI界面
function updateUI() {
    updateProgress();
    updateDrawnNumbersList();
    updateButtonStates();
}

// 更新进度条
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const drawnCount = document.getElementById('drawnCount');
    const progress = (drawnNumbers.length / TOTAL_PARTICIPANTS) * 100;
    
    progressFill.style.width = `${progress}%`;
    drawnCount.textContent = drawnNumbers.length;
}

// 更新已抽中号码列表
function updateDrawnNumbersList() {
    const drawnNumbersContainer = document.getElementById('drawnNumbers');
    
    if (drawnNumbers.length === 0) {
        drawnNumbersContainer.innerHTML = '<div class="empty-message">还没有人抽中，快来抽奖吧！</div>';
        return;
    }
    
    // 按升序排序显示
    const sortedNumbers = [...drawnNumbers].sort((a, b) => a - b);
    
    drawnNumbersContainer.innerHTML = sortedNumbers.map(number => 
        `<div class="drawn-number">${number}</div>`
    ).join('');
    
    // 滚动到底部显示最新抽中的号码
    drawnNumbersContainer.scrollTop = drawnNumbersContainer.scrollHeight;
}

// 更新按钮状态
function updateButtonStates() {
    const startButton = document.getElementById('startLottery');
    const resetButton = document.getElementById('resetLottery');
    
    if (drawnNumbers.length >= TOTAL_PARTICIPANTS) {
        startButton.disabled = true;
        startButton.textContent = '🎉 抽奖完成 🎉';
    } else {
        startButton.disabled = isDrawing;
        if (!isDrawing) {
            startButton.textContent = drawnNumbers.length === 0 ? '🎊 开始抽奖 🎊' : '🎊 继续抽奖 🎊';
        }
    }
}

// 重新开始抽奖
function resetLottery() {
    if (isDrawing) {
        showMessage('正在抽奖中，请稍候重试！');
        return;
    }
    
    // 确认对话框
    if (drawnNumbers.length > 0 && !confirm('确定要重新开始吗？这将清除所有已抽中的号码！')) {
        return;
    }
    
    // 重置数据
    drawnNumbers = [];
    saveData();
    
    // 更新UI
    updateUI();
    
    // 重置显示
    const lotteryNumber = document.getElementById('lotteryNumber');
    const lotteryStatus = document.getElementById('lotteryStatus');
    
    lotteryNumber.innerHTML = '<span class="placeholder">?</span>';
    lotteryStatus.textContent = '点击开始抽奖';
    
    // 重置按钮
    const startButton = document.getElementById('startLottery');
    startButton.disabled = false;
    startButton.textContent = '🎊 开始抽奖 🎊';
    
    showMessage('抽奖已重新开始！');
}

// 显示消息
function showMessage(message) {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #ff5252);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.5rem;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        border: 3px solid rgba(255, 255, 255, 0.3);
        animation: messageSlide 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes messageSlide {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 0;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除消息
    setTimeout(() => {
        messageDiv.style.animation = 'messageSlide 0.3s ease-out reverse';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 创建庆祝动画
function createCelebration() {
    const celebration = document.getElementById('celebration');
    
    // 创建彩带效果
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 100);
    }
    
    // 创建烟花效果
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 200);
    }
}

// 创建彩带
function createConfetti() {
    const celebration = document.getElementById('celebration');
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // 随机位置、颜色和动画延迟
    const colors = ['#ff6b6b', '#ffd700', '#ff4757', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${color};
        animation-delay: ${Math.random() * 3}s;
        animation-duration: ${3 + Math.random() * 2}s;
    `;
    
    celebration.appendChild(confetti);
    
    // 5秒后移除元素
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

// 创建烟花
function createFirework() {
    const celebration = document.getElementById('celebration');
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    const colors = ['#ff6b6b', '#ffd700', '#ff4757', '#f39c12', '#2ecc71'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    firework.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: ${color};
        box-shadow: 0 0 20px ${color};
        animation-delay: ${Math.random() * 0.5}s;
    `;
    
    celebration.appendChild(firework);
    
    // 2秒后移除元素
    setTimeout(() => {
        if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
        }
    }, 2000);
}

// 清除所有庆祝元素（防止内存泄漏）
function clearCelebration() {
    const celebration = document.getElementById('celebration');
    celebration.innerHTML = '';
}

// 每30秒清理一次庆祝元素
setInterval(clearCelebration, 30000);

// 页面卸载前保存数据
window.addEventListener('beforeunload', function() {
    saveData();
});

// 导出函数供HTML调用
window.startLottery = startLottery;
window.resetLottery = resetLottery;