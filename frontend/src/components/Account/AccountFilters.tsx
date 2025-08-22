import type {FC} from 'react'

interface AccountFiltersProps {
    keyword: string;
    setKeyword: (keyword: string) => void;
    filterStatus: string;
    setFilterStatus: (filterStatus: string) => void;
}
export const AccountFilters: FC<AccountFiltersProps> = ({
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
}) => {
    return(
        <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center gap-4 fles-wrap'>
                <div className='flex-1 min-w-64'>
                    <input
                        type="text"
                        placeholder='Tìm kiếm tài khoản...'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none" 
                >
                    <option value="">Tất cả</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>
            </div>
        </div>
    )
}

