import { useEffect, useImperativeHandle, useState, forwardRef } from "react"
import styles from "@/components/editor/Editor.module.scss"

const MentionList = forwardRef((properties, reference) => {
  const [selectedIndex, setSelectedIndex] = useState({
    category: null,
    index: 0,
  })

  const selectItem = (key, index) => {
    const item = properties.items[key]?.[index]
    if (item) {
      properties.command(item)
    }
  }

  const itemKeys = [
    "Character",
    "Vehicle",
    "Party",
    "Site",
    "Faction",
    "Weapon",
    "Schtick",
    "Juncture",
  ]
  const validCategories = itemKeys.filter(
    key => Array.isArray(properties.items?.[key]) && properties.items[key].length > 0
  )
  const totalItems = validCategories.reduce(
    (sum, key) => sum + properties.items[key].length,
    0
  )

  const getNextCategory = (currentKey, direction) => {
    if (validCategories.length === 0) return null
    const currentIndex = validCategories.indexOf(currentKey)
    if (currentIndex === -1) return validCategories[0]
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % validCategories.length
        : (currentIndex - 1 + validCategories.length) % validCategories.length
    return validCategories[nextIndex]
  }

  const upHandler = () => {
    setSelectedIndex(({ category, index }) => {
      if (validCategories.length === 0) return { category: null, index: 0 }
      const currentCategory =
        category && properties.items[category]?.length
          ? category
          : validCategories[0]
      if (index > 0) {
        return { category: currentCategory, index: index - 1 }
      }
      const previousKey = getNextCategory(currentCategory, "prev")
      return {
        category: previousKey,
        index: properties.items[previousKey]?.length - 1 || 0,
      }
    })
  }

  const downHandler = () => {
    setSelectedIndex(({ category, index }) => {
      if (validCategories.length === 0) return { category: null, index: 0 }
      const currentCategory =
        category && properties.items[category]?.length
          ? category
          : validCategories[0]
      if (index < properties.items[currentCategory].length - 1) {
        return { category: currentCategory, index: index + 1 }
      }
      const nextKey = getNextCategory(currentCategory, "next")
      return { category: nextKey, index: 0 }
    })
  }

  const enterHandler = () => {
    if (
      selectedIndex.category &&
      properties.items[selectedIndex.category]?.[selectedIndex.index]
    ) {
      selectItem(selectedIndex.category, selectedIndex.index)
    }
  }

  useEffect(() => {
    const firstKey = validCategories[0] || null
    setSelectedIndex(previous => {
      if (previous.category === firstKey && previous.index === 0) return previous
      return { category: firstKey, index: 0 }
    })
  }, [properties.items])

  useImperativeHandle(reference, () => ({
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
    },
  }))

  if (!properties.items || !totalItems) {
    return (
      <div className={styles.mentionSuggestions}>
        <div className={styles.mentionItem}>No result</div>
      </div>
    )
  }

  return (
    <div className={styles.mentionSuggestions}>
      {itemKeys.map(key => {
        const items = Array.isArray(properties.items[key]) ? properties.items[key] : []
        if (items.length === 0) return null
        return (
          <div key={key} className={styles.mentionCategory}>
            <div className={styles.mentionCategoryLabel}>{key}</div>
            {items.map((item, index) => (
              <button
                className={`${styles.mentionItem} ${
                  selectedIndex.category === key && selectedIndex.index === index
                    ? styles.selectedMentionItem
                    : ""
                }`}
                key={index}
                onClick={() => selectItem(key, index)}
                onMouseEnter={() =>
                  setSelectedIndex({ category: key, index: index })
                }
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
