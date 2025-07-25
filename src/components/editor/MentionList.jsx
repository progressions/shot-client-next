import { useEffect, useImperativeHandle, useState, forwardRef } from "react"
import styles from "@/components/editor/Editor.module.scss"

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState({ category: null, index: 0 })

  const selectItem = (key, index) => {
    const item = props.items[key]?.[index]
    if (item) {
      props.command(item)
    }
  }

  const itemKeys = ["Character", "Vehicle", "Party", "Site", "Faction", "Weapon", "Schtick", "Juncture"]
  const validCategories = itemKeys.filter((key) => Array.isArray(props.items?.[key]) && props.items[key].length > 0)
  const totalItems = validCategories.reduce((sum, key) => sum + props.items[key].length, 0)

  const getNextCategory = (currentKey, direction) => {
    if (!validCategories.length) return null
    const currentIdx = validCategories.indexOf(currentKey)
    if (currentIdx === -1) return validCategories[0]
    const nextIdx =
      direction === "next"
        ? (currentIdx + 1) % validCategories.length
        : (currentIdx - 1 + validCategories.length) % validCategories.length
    return validCategories[nextIdx]
  }

  const upHandler = () => {
    setSelectedIndex(({ category, index }) => {
      if (!validCategories.length) return { category: null, index: 0 }
      const currentCategory = category && props.items[category]?.length ? category : validCategories[0]
      if (index > 0) {
        return { category: currentCategory, index: index - 1 }
      }
      const prevKey = getNextCategory(currentCategory, "prev")
      return {
        category: prevKey,
        index: props.items[prevKey]?.length - 1 || 0
      }
    })
  }

  const downHandler = () => {
    setSelectedIndex(({ category, index }) => {
      if (!validCategories.length) return { category: null, index: 0 }
      const currentCategory = category && props.items[category]?.length ? category : validCategories[0]
      if (index < props.items[currentCategory].length - 1) {
        return { category: currentCategory, index: index + 1 }
      }
      const nextKey = getNextCategory(currentCategory, "next")
      return { category: nextKey, index: 0 }
    })
  }

  const enterHandler = () => {
    if (selectedIndex.category && props.items[selectedIndex.category]?.[selectedIndex.index]) {
      selectItem(selectedIndex.category, selectedIndex.index)
    }
  }

  useEffect(() => {
    const firstKey = validCategories[0] || null
    setSelectedIndex((prev) => {
      if (prev.category === firstKey && prev.index === 0) return prev
      return { category: firstKey, index: 0 }
    })
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler()
        return true
      }
      if (event.key === "ArrowDown") {
        downHandler()
        return true
      }
      if (event.key === "Enter") {
        enterHandler()
        return true
      }
      return false
    }
  }))

  if (!props.items || !totalItems) {
    return (
      <div className={styles.mentionSuggestions}>
        <div className={styles.mentionItem}>No result</div>
      </div>
    )
  }

  return (
    <div className={styles.mentionSuggestions}>
      {itemKeys.map((key) => {
        const items = Array.isArray(props.items[key]) ? props.items[key] : []
        if (!items.length) return null
        return (
          <div key={key} className={styles.mentionCategory}>
            <div className={styles.mentionCategoryLabel}>{key}</div>
            {items.map((item, idx) => (
              <button
                className={`${styles.mentionItem} ${
                  selectedIndex.category === key && selectedIndex.index === idx
                    ? styles.selectedMentionItem
                    : ""
                }`}
                key={idx}
                onClick={() => selectItem(key, idx)}
                onMouseEnter={() => setSelectedIndex({ category: key, index: idx })}
              >
                {item.label}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
})

MentionList.displayName = "MentionList"

export default MentionList
