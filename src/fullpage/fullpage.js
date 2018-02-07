(function ($) {
    const debounce = fn => {
        let running
        return (...args) => {
            running || fn.apply(null, args)
            running = true
            setTimeout(() => {
                running = false
            }, 5000)
        }
    }
    $('.fullpage').forEach(holder => {
        let index = 0
        const inner = holder.children[0]
        const sections = inner.children
        const refresh = () => inner.style.cssText = `transform: translateY(-${holder.clientHeight * index}px)`
        addEventListener('resize', debounce(refresh))
        const mousewheel = debounce(e => {
            if (e.deltaY > 0) {
                index = Math.min(index + 1, sections.length)
            } else {
                index = Math.max(index - 1, 0)
            }
            console.log(index)
            refresh()
        })
        holder.addEventListener('mousewheel', mousewheel)
        holder.addEventListener('touchmove', e => {

        })
    })
})(sel => document.querySelectorAll(sel))