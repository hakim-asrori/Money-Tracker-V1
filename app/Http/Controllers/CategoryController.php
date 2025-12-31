<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use App\Enums\CategoryTypeConstant;
use App\Models\Category;
use Inertia\Inertia;

class CategoryController extends Controller
{
    protected $user;

    public function __construct(
        protected Category $category
    ) {
        $this->user = Auth::user();
    }

    public function index(Request $request)
    {
        $categoryTypes = CategoryTypeConstant::toArray();

        $queryCategory = $this->category->query();
        $queryCategory->when($request->has('type') && $request->get('type') != '-1' && $request->filled('type'), function ($query) use ($request) {
            $query->where('type', $request->get('type'));
        });
        $queryCategory->when($request->has('search') && $request->filled('search'), function ($query) use ($request) {
            $query->where('name', 'like', '%' . $request->get('search') . '%');
        });
        $queryCategory->where('user_id', $this->user->id);
        $queryCategory->orderBy('type', 'asc');
        $categories = $queryCategory->paginate($request->get('perPage', 10));
        $categories->getCollection()->transform(function ($category) {
            $category->type_desc = CategoryTypeConstant::getMessage($category->type);

            return $category;
        });

        return Inertia::render('category', [
            'categoryTypes' => $categoryTypes,
            'categories' => $categories,
            'filters' => $request->only('search', 'type', 'perPage', 'page'),
        ]);
    }


    public function create()
    {
        //
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:3|max:100',
            'type' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $this->category->create([
                'name' => $request->name,
                'type' => $request->type,
                'user_id' => $this->user->id
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Category created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function show(string $id)
    {
        //
    }


    public function edit(string $id)
    {
        //
    }


    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|min:3|max:100',
            'type' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $category->update([
                'name' => $request->name,
                'type' => $request->type
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Category updated successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }


    public function destroy(Category $category)
    {
        DB::beginTransaction();

        try {
            $category->delete();

            DB::commit();
            return  redirect()->back()->with('success', 'Category deleted successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return redirect()->back()->with('error', $th->getMessage());
        }
    }
}
