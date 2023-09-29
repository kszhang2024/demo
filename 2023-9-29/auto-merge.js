const createAutoMergeRequest = (fn, windowMs = 200) => {
    let queue = [];
    let timer = null;

    const submitQueue = async () => {
        timer = null;  // 清空计时器，以接受后续请求
        const _queue = [...queue];
        queue = [];

        try {
            const list = await fn(_queue.map(q => q.params));
            _queue.forEach((q1, i) => {
                q1.resolve(list[i]);
            });
        } catch (err) {
            _queue.forEach(q2 => {
                q2.reject(err);
            })
        }
    }

    return (params) => {
        if (!timer) {
            // 如果没有开始窗口期，则创建
            timer = window.setTimeout(() => {
                submitQueue();
            }, windowMs);
        }

        return new Promise((resolve, reject) => {
            queue.push({
                params,
                resolve,
                reject,
            });
        })
    }
}

const fetchUserInfo = createAutoMergeRequest(
    async (userIds) => {
        const { data } = await request.post('/api/user/getUserInfoList', {
            userIds,
        })

        return data;
    }
);

fetchUserInfo(1)
fetchUserInfo(2)
fetchUserInfo(3)