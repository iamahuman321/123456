// Advanced search functionality for notes
class NotesSearch {
    constructor() {
        this.searchIndex = new Map()
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []
        this.maxHistoryItems = 10
    }

    // Build search index for faster searching
    buildSearchIndex(notes) {
        this.searchIndex.clear()
        
        notes.forEach(note => {
            const searchableText = [
                note.title || '',
                note.content || '',
                ...(note.categories || []).map(catId => {
                    const category = window.categories?.find(c => c.id === catId)
                    return category ? category.name : ''
                }),
                ...(note.list?.items || []).map(item => item.text || ''),
                note.createdAt ? this.formatDateForSearch(note.createdAt) : '',
                note.updatedAt ? this.formatDateForSearch(note.updatedAt) : ''
            ].join(' ').toLowerCase()

            // Create word index
            const words = searchableText.split(/\s+/).filter(word => word.length > 0)
            words.forEach(word => {
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, new Set())
                }
                this.searchIndex.get(word).add(note.id)
            })
        })
    }

    // Advanced search with multiple criteria
    search(query, options = {}) {
        if (!query || query.trim().length === 0) {
            return []
        }

        const {
            notes = [],
            categories = [],
            searchInContent = true,
            searchInTitle = true,
            searchInCategories = true,
            searchInLists = true,
            dateRange = null,
            hasPassword = null,
            hasImages = null,
            hasList = null
        } = options

        // Parse search query
        const searchTerms = this.parseSearchQuery(query.toLowerCase())
        let results = new Set()

        // Search using index for better performance
        if (searchTerms.simple.length > 0) {
            const firstTerm = searchTerms.simple[0]
            const matchingWords = Array.from(this.searchIndex.keys()).filter(word => 
                word.includes(firstTerm)
            )

            matchingWords.forEach(word => {
                const noteIds = this.searchIndex.get(word)
                noteIds.forEach(id => results.add(id))
            })
        }

        // Filter results based on actual note content and additional criteria
        const filteredResults = notes.filter(note => {
            if (results.size > 0 && !results.has(note.id)) {
                return false
            }

            // Text search
            if (searchTerms.simple.length > 0) {
                const noteText = this.getNoteSearchText(note, {
                    searchInContent,
                    searchInTitle,
                    searchInCategories,
                    searchInLists
                }).toLowerCase()

                const matchesText = searchTerms.simple.every(term => 
                    noteText.includes(term)
                )

                if (!matchesText) return false
            }

            // Exact phrase search
            if (searchTerms.phrases.length > 0) {
                const noteText = this.getNoteSearchText(note, {
                    searchInContent,
                    searchInTitle,
                    searchInCategories,
                    searchInLists
                }).toLowerCase()

                const matchesPhrase = searchTerms.phrases.every(phrase => 
                    noteText.includes(phrase)
                )

                if (!matchesPhrase) return false
            }

            // Category filter
            if (searchTerms.categories.length > 0) {
                const noteCategories = note.categories || []
                const matchesCategory = searchTerms.categories.some(catName => {
                    const category = categories.find(c => 
                        c.name.toLowerCase().includes(catName)
                    )
                    return category && noteCategories.includes(category.id)
                })

                if (!matchesCategory) return false
            }

            // Date range filter
            if (dateRange) {
                const noteDate = note.updatedAt || note.createdAt
                if (noteDate < dateRange.start || noteDate > dateRange.end) {
                    return false
                }
            }

            // Additional filters
            if (hasPassword !== null && Boolean(note.password) !== hasPassword) {
                return false
            }

            if (hasImages !== null && Boolean(note.images?.length) !== hasImages) {
                return false
            }

            if (hasList !== null && Boolean(note.list?.items?.length) !== hasList) {
                return false
            }

            return true
        })

        // Sort results by relevance
        return this.sortByRelevance(filteredResults, query)
    }

    // Parse search query to extract different types of search terms
    parseSearchQuery(query) {
        const result = {
            simple: [],
            phrases: [],
            categories: [],
            exclude: []
        }

        // Extract quoted phrases
        const phraseRegex = /"([^"]+)"/g
        let match
        while ((match = phraseRegex.exec(query)) !== null) {
            result.phrases.push(match[1])
            query = query.replace(match[0], '')
        }

        // Extract category searches (category:name)
        const categoryRegex = /category:(\w+)/g
        while ((match = categoryRegex.exec(query)) !== null) {
            result.categories.push(match[1])
            query = query.replace(match[0], '')
        }

        // Extract exclusions (-term)
        const excludeRegex = /-(\w+)/g
        while ((match = excludeRegex.exec(query)) !== null) {
            result.exclude.push(match[1])
            query = query.replace(match[0], '')
        }

        // Remaining terms are simple search terms
        result.simple = query.trim().split(/\s+/).filter(term => term.length > 0)

        return result
    }

    // Get searchable text from note
    getNoteSearchText(note, options) {
        const parts = []

        if (options.searchInTitle && note.title) {
            parts.push(note.title)
        }

        if (options.searchInContent && note.content) {
            parts.push(note.content)
        }

        if (options.searchInCategories && note.categories) {
            note.categories.forEach(catId => {
                const category = window.categories?.find(c => c.id === catId)
                if (category) {
                    parts.push(category.name)
                }
            })
        }

        if (options.searchInLists && note.list?.items) {
            note.list.items.forEach(item => {
                if (item.text) {
                    parts.push(item.text)
                }
            })
        }

        return parts.join(' ')
    }

    // Sort results by relevance score
    sortByRelevance(notes, query) {
        const queryTerms = query.toLowerCase().split(/\s+/)

        return notes.map(note => ({
            note,
            score: this.calculateRelevanceScore(note, queryTerms)
        }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.note)
    }

    // Calculate relevance score for a note
    calculateRelevanceScore(note, queryTerms) {
        let score = 0
        const title = (note.title || '').toLowerCase()
        const content = (note.content || '').toLowerCase()

        queryTerms.forEach(term => {
            // Title matches are worth more
            if (title.includes(term)) {
                score += title === term ? 100 : 50
            }

            // Content matches
            if (content.includes(term)) {
                score += 10
            }

            // Exact word matches are worth more
            const titleWords = title.split(/\s+/)
            const contentWords = content.split(/\s+/)

            if (titleWords.includes(term)) {
                score += 25
            }

            if (contentWords.includes(term)) {
                score += 5
            }
        })

        // Boost score for recent notes
        const daysSinceUpdate = (Date.now() - (note.updatedAt || note.createdAt)) / (1000 * 60 * 60 * 24)
        if (daysSinceUpdate < 7) {
            score += 10
        } else if (daysSinceUpdate < 30) {
            score += 5
        }

        return score
    }

    // Format date for search indexing
    formatDateForSearch(timestamp) {
        const date = new Date(timestamp)
        return [
            date.getFullYear(),
            date.toLocaleDateString('en-US', { month: 'long' }),
            date.toLocaleDateString('en-US', { weekday: 'long' }),
            'today',
            'yesterday',
            'this week',
            'this month',
            'this year'
        ].join(' ')
    }

    // Add search to history
    addToHistory(query) {
        if (!query || query.trim().length === 0) return

        const trimmedQuery = query.trim()
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== trimmedQuery)
        
        // Add to beginning
        this.searchHistory.unshift(trimmedQuery)
        
        // Limit history size
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems)
        }

        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
    }

    // Get search suggestions
    getSuggestions(query, notes, categories) {
        const suggestions = []

        if (!query || query.length < 2) {
            // Return recent searches
            return this.searchHistory.slice(0, 5).map(item => ({
                type: 'history',
                text: item,
                icon: 'fas fa-history'
            }))
        }

        const lowerQuery = query.toLowerCase()

        // Category suggestions
        categories.forEach(category => {
            if (category.name.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    type: 'category',
                    text: `category:${category.name}`,
                    icon: 'fas fa-folder',
                    description: `Search in ${category.name} category`
                })
            }
        })

        // Note title suggestions
        notes.forEach(note => {
            if (note.title && note.title.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    type: 'note',
                    text: note.title,
                    icon: 'fas fa-file-text',
                    description: 'Note title'
                })
            }
        })

        // Search operators
        if ('category'.includes(lowerQuery)) {
            suggestions.push({
                type: 'operator',
                text: 'category:',
                icon: 'fas fa-filter',
                description: 'Search by category'
            })
        }

        if ('has'.includes(lowerQuery)) {
            suggestions.push({
                type: 'operator',
                text: 'has:password',
                icon: 'fas fa-lock',
                description: 'Notes with password'
            })
            suggestions.push({
                type: 'operator',
                text: 'has:images',
                icon: 'fas fa-image',
                description: 'Notes with images'
            })
            suggestions.push({
                type: 'operator',
                text: 'has:list',
                icon: 'fas fa-list',
                description: 'Notes with lists'
            })
        }

        return suggestions.slice(0, 8)
    }

    // Clear search history
    clearHistory() {
        this.searchHistory = []
        localStorage.removeItem('searchHistory')
    }
}

// Export for use in other files
window.NotesSearch = NotesSearch