import ApiKeys from './ApiKeys';
import { Book, Code, Terminal } from 'lucide-react';
import { API_URL } from '../services/api';

export default function DeveloperApi() {
    return (
        <div className="h-full flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Developer API</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Integrate Social Raven features directly into your application using our REST API.
                </p>
            </div>

            {/* Documentation Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                        <Book className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Documentation</h3>
                    <p className="text-sm text-slate-500 mb-4">Complete reference for all available endpoints and models.</p>
                    <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm font-medium hover:underline">View Docs &rarr;</a>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                        <Code className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">SDKs & Libraries</h3>
                    <p className="text-sm text-slate-500 mb-4">Official client libraries for Python, Node.js, and Go.</p>
                    <button className="text-indigo-600 text-sm font-medium hover:underline">Download SDKs &rarr;</button>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-4">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Guides</h3>
                    <p className="text-sm text-slate-500 mb-4">Step-by-step tutorials to get up and running quickly.</p>
                    <button className="text-indigo-600 text-sm font-medium hover:underline">Read Guides &rarr;</button>
                </div>
            </div>

            {/* API Keys Management */}
            <div className="flex-1 min-h-0">
                <ApiKeys />
            </div>
        </div>
    );
}
