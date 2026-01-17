"use client"

import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Box, Typography, Link as MuiLink } from "@mui/material"
import type { Components } from "react-markdown"
import EntityLink from "@/components/ui/links/EntityLink"
import { useEntityName } from "@/hooks"
import type { Entity } from "@/types"

type RichDescriptionProps = {
  markdown: string | null | undefined
  mentions?: Record<string, string[]>
}

// Regex to match mention syntax: [[@entity_type:uuid|Display Name]]
const MENTION_REGEX = /\[\[@(\w+):([a-f0-9-]+)\|([^\]]+)\]\]/g

// Valid entity types for mentions
// Must match entity types supported by useEntityName hook
const VALID_ENTITY_TYPES = new Set([
  "character",
  "site",
  "party",
  "faction",
  "juncture",
])

/**
 * Capitalize first letter of entity type for EntityLink's entity_class.
 * e.g., "character" -> "Character"
 */
function capitalizeEntityType(entityType: string): string {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1)
}

/**
 * MentionLink component renders a single mention using EntityLink.
 * Uses useEntityName hook for real-time name updates via WebSocket.
 */
function MentionLink({
  entityType,
  entityId,
  displayName,
}: {
  entityType: string
  entityId: string
  displayName: string
}) {
  const entityClass = capitalizeEntityType(entityType)
  const { name } = useEntityName(entityId, entityClass)

  return (
    <EntityLink entity={{ id: entityId, entity_class: entityClass } as Entity}>
      {name || displayName}
    </EntityLink>
  )
}

/**
 * Process markdown text and convert mention syntax to EntityLink components.
 * Converts [[@character:uuid|Name]] to <MentionLink> with hover popups and real-time updates.
 */
function processMentions(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex state
  MENTION_REGEX.lastIndex = 0

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [, entityType, entityId, displayName] = match

    if (VALID_ENTITY_TYPES.has(entityType)) {
      parts.push(
        <MentionLink
          key={`${entityId}-${match.index}`}
          entityType={entityType}
          entityId={entityId}
          displayName={displayName}
        />
      )
    } else {
      // Unknown entity type - just show the display name
      parts.push(displayName)
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

/**
 * RichDescription component renders markdown content with mention support.
 * Mentions in the format [[@entity_type:uuid|Display Name]] are converted to
 * clickable links that navigate to the entity's show page.
 */
export function RichDescription({
  markdown,
  mentions: _mentions,
}: RichDescriptionProps) {
  // Custom components for react-markdown
  const components: Components = useMemo(
    () => ({
      // Process text nodes to convert mentions to links
      p: ({ children }) => (
        <Typography variant="body1" sx={{ mb: 2, "&:last-child": { mb: 0 } }}>
          {processChildren(children)}
        </Typography>
      ),
      h1: ({ children }) => (
        <Typography variant="h4" sx={{ mb: 2, mt: 3 }}>
          {processChildren(children)}
        </Typography>
      ),
      h2: ({ children }) => (
        <Typography variant="h5" sx={{ mb: 2, mt: 2 }}>
          {processChildren(children)}
        </Typography>
      ),
      h3: ({ children }) => (
        <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
          {processChildren(children)}
        </Typography>
      ),
      ul: ({ children }) => (
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          {children}
        </Box>
      ),
      ol: ({ children }) => (
        <Box component="ol" sx={{ pl: 3, mb: 2 }}>
          {children}
        </Box>
      ),
      li: ({ children }) => (
        <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
          {processChildren(children)}
        </Typography>
      ),
      blockquote: ({ children }) => (
        <Box
          component="blockquote"
          sx={theme => ({
            borderLeft: `4px solid ${theme.palette.divider}`,
            pl: 2,
            py: 1,
            my: 2,
            bgcolor: theme.palette.action.hover,
            fontStyle: "italic",
          })}
        >
          {children}
        </Box>
      ),
      code: ({ children, className }) => {
        const isInline = !className
        if (isInline) {
          return (
            <Box
              component="code"
              sx={theme => ({
                bgcolor: theme.palette.action.hover,
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: "monospace",
                fontSize: "0.875em",
              })}
            >
              {children}
            </Box>
          )
        }
        return (
          <Box
            component="pre"
            sx={theme => ({
              bgcolor: theme.palette.grey[900],
              color: theme.palette.grey[100],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              my: 2,
            })}
          >
            <code>{children}</code>
          </Box>
        )
      },
      hr: () => (
        <Box
          component="hr"
          sx={theme => ({
            border: "none",
            borderTop: `1px solid ${theme.palette.divider}`,
            my: 3,
          })}
        />
      ),
      a: ({ href, children }) => (
        <MuiLink
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {children}
        </MuiLink>
      ),
    }),
    []
  )

  if (!markdown) {
    return null
  }

  return (
    <Box
      sx={theme => ({
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
        lineHeight: 1.7,
        color: theme.palette.text.primary,
      })}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </Box>
  )
}

/**
 * Process children nodes, converting string children with mentions to links.
 */
function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") {
    return processMentions(children)
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === "string") {
        const processed = processMentions(child)
        return processed.length === 1 ? (
          processed[0]
        ) : (
          <span key={index}>{processed}</span>
        )
      }
      return child
    })
  }
  return children
}
